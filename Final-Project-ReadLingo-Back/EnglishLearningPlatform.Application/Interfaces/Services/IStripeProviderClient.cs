using EnglishLearningPlatform.Application.DTOs.Subscription;

namespace EnglishLearningPlatform.Application.Interfaces.Services;

public interface IStripeProviderClient
{
    Task<string> GetOrCreateCustomerAsync(string email, string? existingCustomerId, CancellationToken cancellationToken = default);

    Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(
        string stripeCustomerId, string priceId, string successUrl, string cancelUrl, CancellationToken cancellationToken = default);

    Task CancelSubscriptionAsync(string stripeSubscriptionId, CancellationToken cancellationToken = default);

    Task<StripeWebhookEventDto?> GetSessionAsync(string sessionId, CancellationToken cancellationToken = default);

    StripeWebhookEventDto ParseWebhookEvent(string requestBody, string stripeSignatureHeader);
}