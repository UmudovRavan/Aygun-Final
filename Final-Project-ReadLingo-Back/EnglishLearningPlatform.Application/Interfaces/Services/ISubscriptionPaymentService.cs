using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Responses;

namespace EnglishLearningPlatform.Application.Interfaces.Services;

public interface ISubscriptionPaymentService
{
    Task<Result<CheckoutSessionResponseDto>> CreateCheckoutSessionAsync(
        Guid userId, CreateCheckoutSessionRequestDto dto, CancellationToken cancellationToken = default);

    Task<Result> HandleWebhookEventAsync(
        string requestBody, string stripeSignatureHeader, CancellationToken cancellationToken = default);

    Task<Result<ManageSubscriptionResponseDto>> GetCurrentSubscriptionAsync(
        Guid userId, CancellationToken cancellationToken = default);

    Task<Result<ManageSubscriptionResponseDto>> VerifySessionAsync(
        Guid userId, string sessionId, CancellationToken cancellationToken = default);

    Task<Result> CancelSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);
}