using EnglishLearningPlatform.Application.Exceptions;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{

    public class SubscriptionAccessService : ISubscriptionAccessService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SubscriptionAccessService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SubscriptionTier> GetCurrentTierAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var activeSubscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            if (activeSubscription != null)
                return activeSubscription.Tier;

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            return user?.CurrentTier ?? SubscriptionTier.Free;
        }

        public async Task EnsureTierAsync(
            Guid userId, SubscriptionTier requiredTier, CancellationToken cancellationToken = default)
        {
            var currentTier = await GetCurrentTierAsync(userId, cancellationToken);

            if (currentTier >= requiredTier)
                return;

            var tierName = requiredTier switch
            {
                SubscriptionTier.Pro => "Pro",
                SubscriptionTier.Premium => "Premium",
                _ => requiredTier.ToString(),
            };

            throw new ForbiddenAccessException($"This feature requires a {tierName} subscription. Please upgrade to continue.");
        }
    }
}
