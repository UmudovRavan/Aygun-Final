using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface ISubscriptionAccessService
    {
        Task<SubscriptionTier> GetCurrentTierAsync(Guid userId, CancellationToken cancellationToken = default);

        Task EnsureTierAsync(Guid userId, SubscriptionTier requiredTier, CancellationToken cancellationToken = default);
    }
}
