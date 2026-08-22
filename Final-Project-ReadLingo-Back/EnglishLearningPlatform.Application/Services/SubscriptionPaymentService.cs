using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;

namespace EnglishLearningPlatform.Application.Services;

public class SubscriptionPaymentService : ISubscriptionPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStripeProviderClient _stripeProviderClient;
    private readonly IStripePriceMap _priceMap;

    public SubscriptionPaymentService(
        IUnitOfWork unitOfWork, IStripeProviderClient stripeProviderClient, IStripePriceMap priceMap)
    {
        _unitOfWork = unitOfWork;
        _stripeProviderClient = stripeProviderClient;
        _priceMap = priceMap;
    }

    public async Task<Result<CheckoutSessionResponseDto>> CreateCheckoutSessionAsync(
        Guid userId, CreateCheckoutSessionRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Tier == SubscriptionTier.Free)
            return Result<CheckoutSessionResponseDto>.Failure("Cannot create a checkout session for the Free plan.");

        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CheckoutSessionResponseDto>.Failure("User not found.");

        var priceId = _priceMap.GetPriceId(dto.Tier);
        if (priceId is null)
            return Result<CheckoutSessionResponseDto>.Failure("This plan is not currently available for purchase.");

        var existingSubscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);

        var customerId = await _stripeProviderClient.GetOrCreateCustomerAsync(
            user.Email!, existingSubscription?.StripeCustomerId, cancellationToken);

        var session = await _stripeProviderClient.CreateCheckoutSessionAsync(
            customerId, priceId, dto.SuccessUrl, dto.CancelUrl, cancellationToken);

        return Result<CheckoutSessionResponseDto>.Success(session, "Checkout session created.");
    }

    public async Task<Result> HandleWebhookEventAsync(
        string requestBody, string stripeSignatureHeader, CancellationToken cancellationToken = default)
    {
        StripeWebhookEventDto webhookEvent;
        try
        {
            webhookEvent = _stripeProviderClient.ParseWebhookEvent(requestBody, stripeSignatureHeader);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Invalid webhook signature or payload: {ex.Message}");
        }

        return webhookEvent.EventType switch
        {
            "checkout.session.completed" => await HandleCheckoutCompletedAsync(webhookEvent, cancellationToken),
            "customer.subscription.created" or "customer.subscription.updated"
                => await HandleSubscriptionUpdatedAsync(webhookEvent, cancellationToken),
            "customer.subscription.deleted" => await HandleSubscriptionDeletedAsync(webhookEvent, cancellationToken),
            "invoice.payment_succeeded" => await HandlePaymentSucceededAsync(webhookEvent, cancellationToken),
            "invoice.payment_failed" => await HandlePaymentFailedAsync(webhookEvent, cancellationToken),
            _ => Result.Success("Event type not handled - ignored."),
        };
    }

    public async Task<Result<ManageSubscriptionResponseDto>> GetCurrentSubscriptionAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var subscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);

        if (subscription is null)
        {
            return Result<ManageSubscriptionResponseDto>.Success(new ManageSubscriptionResponseDto
            {
                Tier = SubscriptionTier.Free,
                Status = SubscriptionStatus.Active,
                StartDate = DateTime.UtcNow,
                AutoRenew = false,
                HasStripeSubscription = false,
            });
        }

        return Result<ManageSubscriptionResponseDto>.Success(new ManageSubscriptionResponseDto
        {
            Tier = subscription.Tier,
            Status = subscription.Status,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
            AutoRenew = subscription.AutoRenew,
            HasStripeSubscription = !string.IsNullOrEmpty(subscription.StripeSubscriptionId),
        });
    }

    public async Task<Result<ManageSubscriptionResponseDto>> VerifySessionAsync(
        Guid userId, string sessionId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            return Result<ManageSubscriptionResponseDto>.Failure("Session ID is required.");

        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<ManageSubscriptionResponseDto>.Failure("User not found.");

        var sessionData = await _stripeProviderClient.GetSessionAsync(sessionId, cancellationToken);
        if (sessionData == null)
            return Result<ManageSubscriptionResponseDto>.Failure("Could not verify session with Stripe.");

        var tierStr = sessionData.Metadata?.GetValueOrDefault("Tier");
        var tier = Enum.TryParse<SubscriptionTier>(tierStr, out var parsedTier)
            ? parsedTier
            : _priceMap.GetTierByPriceId(sessionData.StripePriceId) ?? SubscriptionTier.Pro;

        var existingSubscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
        if (existingSubscription == null)
        {
            existingSubscription = new Subscription
            {
                AppUserId = user.Id,
                PlanName = tier.ToString(),
                PlanType = SubscriptionPlanType.Monthly,
                Tier = tier,
                Status = SubscriptionStatus.Active,
                StartDate = DateTime.UtcNow,
                EndDate = sessionData.CurrentPeriodEnd ?? DateTime.UtcNow.AddMonths(1),
                IsActive = true,
                AutoRenew = true,
                StripeCustomerId = sessionData.StripeCustomerId,
                StripeSubscriptionId = sessionData.StripeSubscriptionId,
                StripeSessionId = sessionId,
            };
            await _unitOfWork.Subscriptions.AddAsync(existingSubscription, cancellationToken);
        }
        else
        {
            existingSubscription.Tier = tier;
            existingSubscription.PlanName = tier.ToString();
            existingSubscription.Status = SubscriptionStatus.Active;
            existingSubscription.IsActive = true;
            existingSubscription.EndDate = sessionData.CurrentPeriodEnd ?? DateTime.UtcNow.AddMonths(1);
            if (!string.IsNullOrEmpty(sessionData.StripeCustomerId)) existingSubscription.StripeCustomerId = sessionData.StripeCustomerId;
            if (!string.IsNullOrEmpty(sessionData.StripeSubscriptionId)) existingSubscription.StripeSubscriptionId = sessionData.StripeSubscriptionId;
            existingSubscription.StripeSessionId = sessionId;
            _unitOfWork.Subscriptions.Update(existingSubscription);
        }

        user.CurrentTier = tier;
        user.Hearts = 9999;
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Users.Update(user);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ManageSubscriptionResponseDto>.Success(new ManageSubscriptionResponseDto
        {
            Tier = tier,
            Status = SubscriptionStatus.Active,
            StartDate = existingSubscription.StartDate,
            EndDate = existingSubscription.EndDate,
            AutoRenew = true,
            HasStripeSubscription = true,
        }, "Subscription successfully verified and activated.");
    }

    public async Task<Result> CancelSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var subscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
        if (subscription is null || string.IsNullOrEmpty(subscription.StripeSubscriptionId))
            return Result.Failure("No active paid subscription found.");

        await _stripeProviderClient.CancelSubscriptionAsync(subscription.StripeSubscriptionId, cancellationToken);

        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.AutoRenew = false;
        _unitOfWork.Subscriptions.Update(subscription);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success("Subscription cancelled. You will retain access until the current period ends.");
    }


    private async Task<Result> HandleCheckoutCompletedAsync(StripeWebhookEventDto webhookEvent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(webhookEvent.StripeCustomerId))
            return Result.Failure("Webhook payload missing customer id.");

        var user = await _unitOfWork.Users.SingleOrDefaultAsync(
            u => u.Subscriptions.Any(s => s.StripeCustomerId == webhookEvent.StripeCustomerId), cancellationToken);

        if (user is null && !string.IsNullOrEmpty(webhookEvent.CustomerEmail))
        {
            user = await _unitOfWork.Users.GetByEmailAsync(webhookEvent.CustomerEmail, cancellationToken);
        }

    
        if (user is null)
            return Result.Success("Customer not yet linked to a local user - awaiting subscription.created event.");

        var tier = _priceMap.GetTierByPriceId(webhookEvent.StripePriceId) ?? SubscriptionTier.Pro;

        var subscription = new Subscription
        {
            AppUserId = user.Id,
            PlanName = tier.ToString(),
            PlanType = SubscriptionPlanType.Monthly,
            Tier = tier,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = webhookEvent.CurrentPeriodEnd,
            IsActive = true,
            AutoRenew = true,
            StripeCustomerId = webhookEvent.StripeCustomerId,
            StripeSubscriptionId = webhookEvent.StripeSubscriptionId,
            StripeSessionId = webhookEvent.StripeSessionId,
        };

        await _unitOfWork.Subscriptions.AddAsync(subscription, cancellationToken);

        user.CurrentTier = tier;
        _unitOfWork.Users.Update(user);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    private async Task<Result> HandleSubscriptionUpdatedAsync(StripeWebhookEventDto webhookEvent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(webhookEvent.StripeSubscriptionId))
            return Result.Failure("Webhook payload missing subscription id.");

        var subscription = await _unitOfWork.Subscriptions.GetByStripeSubscriptionIdAsync(
            webhookEvent.StripeSubscriptionId, cancellationToken);

        if (subscription is null)
            return Result.Success("Subscription not found locally yet - will be created by checkout.session.completed.");

        subscription.Status = MapStripeStatus(webhookEvent.StripeStatus);
        subscription.EndDate = webhookEvent.CurrentPeriodEnd ?? subscription.EndDate;
        subscription.IsActive = subscription.Status == SubscriptionStatus.Active;

        _unitOfWork.Subscriptions.Update(subscription);

        var user = await _unitOfWork.Users.GetByIdAsync(subscription.AppUserId, cancellationToken);
        if (user != null)
        {
            user.CurrentTier = subscription.Status == SubscriptionStatus.Active ? subscription.Tier : SubscriptionTier.Free;
            _unitOfWork.Users.Update(user);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    private async Task<Result> HandleSubscriptionDeletedAsync(StripeWebhookEventDto webhookEvent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(webhookEvent.StripeSubscriptionId))
            return Result.Failure("Webhook payload missing subscription id.");

        var subscription = await _unitOfWork.Subscriptions.GetByStripeSubscriptionIdAsync(
            webhookEvent.StripeSubscriptionId, cancellationToken);

        if (subscription is null)
            return Result.Success("Subscription already absent locally.");

        subscription.Status = SubscriptionStatus.Expired;
        subscription.IsActive = false;
        subscription.AutoRenew = false;
        subscription.EndDate = DateTime.UtcNow;
        _unitOfWork.Subscriptions.Update(subscription);

        var user = await _unitOfWork.Users.GetByIdAsync(subscription.AppUserId, cancellationToken);
        if (user != null)
        {
            user.CurrentTier = SubscriptionTier.Free;
            _unitOfWork.Users.Update(user);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    private async Task<Result> HandlePaymentSucceededAsync(StripeWebhookEventDto webhookEvent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(webhookEvent.StripeSubscriptionId))
            return Result.Success();

        var subscription = await _unitOfWork.Subscriptions.GetByStripeSubscriptionIdAsync(
            webhookEvent.StripeSubscriptionId, cancellationToken);

        if (subscription is null)
            return Result.Success();

        subscription.Status = SubscriptionStatus.Active;
        subscription.IsActive = true;
        if (webhookEvent.CurrentPeriodEnd.HasValue)
            subscription.EndDate = webhookEvent.CurrentPeriodEnd;

        _unitOfWork.Subscriptions.Update(subscription);

        var user = await _unitOfWork.Users.GetByIdAsync(subscription.AppUserId, cancellationToken);
        if (user != null)
        {
            user.CurrentTier = subscription.Tier;
            _unitOfWork.Users.Update(user);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    private async Task<Result> HandlePaymentFailedAsync(StripeWebhookEventDto webhookEvent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(webhookEvent.StripeSubscriptionId))
            return Result.Success();

        var subscription = await _unitOfWork.Subscriptions.GetByStripeSubscriptionIdAsync(
            webhookEvent.StripeSubscriptionId, cancellationToken);

        if (subscription is null)
            return Result.Success();

       
        subscription.Status = SubscriptionStatus.PastDue;
        _unitOfWork.Subscriptions.Update(subscription);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static SubscriptionStatus MapStripeStatus(string? stripeStatus) => stripeStatus switch
    {
        "active" => SubscriptionStatus.Active,
        "past_due" or "unpaid" => SubscriptionStatus.PastDue,
        "canceled" => SubscriptionStatus.Cancelled,
        _ => SubscriptionStatus.Expired,
    };
}