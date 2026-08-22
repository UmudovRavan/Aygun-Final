using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Domain.Enums;
using EnglishLearningPlatform.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using System;

namespace EnglishLearningPlatform.Infrastructure.Services
{
    public class StripePriceMap : IStripePriceMap
    {
        private readonly StripeSettings _settings;

        public StripePriceMap(IOptions<StripeSettings> settings)
        {
            _settings = settings.Value;
        }

        public string? GetPriceId(SubscriptionTier tier)
        {
            if (_settings.Prices.TryGetValue(tier.ToString(), out var priceId))
            {
                return priceId;
            }
            return null;
        }

        public SubscriptionTier? GetTierByPriceId(string? priceId)
        {
            if (string.IsNullOrEmpty(priceId)) return null;

            foreach (var kvp in _settings.Prices)
            {
                if (kvp.Value.Equals(priceId, StringComparison.OrdinalIgnoreCase))
                {
                    if (Enum.TryParse<SubscriptionTier>(kvp.Key, true, out var tier))
                    {
                        return tier;
                    }
                }
            }
            return null;
        }
    }
}
