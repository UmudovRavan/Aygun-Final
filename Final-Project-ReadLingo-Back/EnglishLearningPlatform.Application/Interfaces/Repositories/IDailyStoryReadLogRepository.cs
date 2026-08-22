using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IDailyStoryReadLogRepository : IGenericRepository<DailyStoryReadLog>
    {
        Task<int> GetDistinctStoryCountForDateAsync(
            Guid userId, DateTime readDate, CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(
            Guid userId, Guid storyId, DateTime readDate, CancellationToken cancellationToken = default);
    }
}
