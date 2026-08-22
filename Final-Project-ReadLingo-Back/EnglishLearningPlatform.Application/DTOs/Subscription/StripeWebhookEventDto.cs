namespace EnglishLearningPlatform.Application.DTOs.Subscription;

public class StripeWebhookEventDto
{
    public string EventType { get; set; } = string.Empty;
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public string? StripeSessionId { get; set; }
    public string? StripePriceId { get; set; }

    public string? StripeStatus { get; set; }

    public DateTime? CurrentPeriodEnd { get; set; }
    public string? CustomerEmail { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
}