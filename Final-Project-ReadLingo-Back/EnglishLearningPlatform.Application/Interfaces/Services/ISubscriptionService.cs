using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{

    public interface ISubscriptionService
    {
        Task<Result<SubscriptionDto>> GetActiveAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<IReadOnlyList<SubscriptionDto>>> GetHistoryAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<SubscriptionDto>> SubscribeAsync(Guid userId, CreateSubscriptionDto dto, CancellationToken cancellationToken = default);
        Task<Result> CancelAsync(Guid userId, Guid subscriptionId, CancellationToken cancellationToken = default);
    }
}
