using EnglishLearningPlatform.Domain.Enums;

namespace EnglishLearningPlatform.Application.Interfaces.Services;

public interface IStripePriceMap
{
    string? GetPriceId(SubscriptionTier tier);
    SubscriptionTier? GetTierByPriceId(string? priceId);
}