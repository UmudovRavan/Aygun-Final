using EnglishLearningPlatform.Domain.Enums;

namespace EnglishLearningPlatform.Application.DTOs.Subscription;

public class ManageSubscriptionResponseDto
{
    public SubscriptionTier Tier { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool AutoRenew { get; set; }
    public bool HasStripeSubscription { get; set; }
}