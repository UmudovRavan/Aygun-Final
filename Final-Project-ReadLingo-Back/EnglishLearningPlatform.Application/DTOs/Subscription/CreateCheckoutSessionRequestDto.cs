using EnglishLearningPlatform.Domain.Enums;

namespace EnglishLearningPlatform.Application.DTOs.Subscription;

public class CreateCheckoutSessionRequestDto
{
    public SubscriptionTier Tier { get; set; }

    public string SuccessUrl { get; set; } = string.Empty;

    public string CancelUrl { get; set; } = string.Empty;
}