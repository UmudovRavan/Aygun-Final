using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SubscriptionService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<SubscriptionDto>> GetActiveAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            if (entity is null)
                return Result<SubscriptionDto>.Failure("No active subscription found.");

            return Result<SubscriptionDto>.Success(_mapper.Map<SubscriptionDto>(entity));
        }

        public async Task<Result<IReadOnlyList<SubscriptionDto>>> GetHistoryAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Subscriptions.FindAsync(s => s.AppUserId == userId, cancellationToken);
            return Result<IReadOnlyList<SubscriptionDto>>.Success(_mapper.Map<IReadOnlyList<SubscriptionDto>>(items));
        }

        public async Task<Result<SubscriptionDto>> SubscribeAsync(
            Guid userId, CreateSubscriptionDto dto, CancellationToken cancellationToken = default)
        {
            var existingActive = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            if (existingActive != null)
            {
                existingActive.IsActive = false;
                existingActive.EndDate = DateTime.UtcNow;
                _unitOfWork.Subscriptions.Update(existingActive);
            }

            var targetTier = Domain.Enums.SubscriptionTier.Free;
            if (dto.PlanName.Contains("Premium", StringComparison.OrdinalIgnoreCase))
                targetTier = Domain.Enums.SubscriptionTier.Premium;
            else if (dto.PlanName.Contains("Pro", StringComparison.OrdinalIgnoreCase))
                targetTier = Domain.Enums.SubscriptionTier.Pro;

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user != null)
            {
                user.CurrentTier = targetTier;
                user.Hearts = targetTier == Domain.Enums.SubscriptionTier.Free ? 5 : 9999;
                _unitOfWork.Users.Update(user);
            }

            var endDate = dto.PlanType switch
            {
                SubscriptionPlanType.Monthly => DateTime.UtcNow.AddMonths(1),
                SubscriptionPlanType.Yearly => DateTime.UtcNow.AddYears(1),
                SubscriptionPlanType.Lifetime => (DateTime?)null,
                _ => (DateTime?)null,
            };

            var subscription = new Subscription
            {
                AppUserId = userId,
                PlanName = dto.PlanName,
                PlanType = dto.PlanType,
                StartDate = DateTime.UtcNow,
                EndDate = endDate,
                IsActive = true,
                AutoRenew = dto.AutoRenew,
                Price = dto.Price,
                Currency = dto.Currency,
            };
            await _unitOfWork.Subscriptions.AddAsync(subscription, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var payment = new Payment
            {
                AppUserId = userId,
                SubscriptionId = subscription.Id,
                Amount = dto.Price,
                Currency = dto.Currency,
                PaymentDate = DateTime.UtcNow,
                Status = PaymentStatus.Completed,
                Method = dto.PaymentMethod,
                TransactionId = Guid.NewGuid().ToString("N"),
            };
            await _unitOfWork.Payments.AddAsync(payment, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<SubscriptionDto>.Success(_mapper.Map<SubscriptionDto>(subscription), "Subscribed successfully.");
        }

        public async Task<Result> CancelAsync(Guid userId, Guid subscriptionId, CancellationToken cancellationToken = default)
        {
            var subscription = await _unitOfWork.Subscriptions.GetByIdAsync(subscriptionId, cancellationToken);
            if (subscription is null || subscription.AppUserId != userId)
                return Result.Failure("Subscription not found.");

            subscription.IsActive = false;
            subscription.AutoRenew = false;
            subscription.EndDate = DateTime.UtcNow;
            _unitOfWork.Subscriptions.Update(subscription);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Subscription cancelled.");
        }
    }
}
