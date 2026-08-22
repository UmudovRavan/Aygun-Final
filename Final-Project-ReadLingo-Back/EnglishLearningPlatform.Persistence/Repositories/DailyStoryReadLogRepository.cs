using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Repositories
{
    public class DailyStoryReadLogRepository : GenericRepository<DailyStoryReadLog>, IDailyStoryReadLogRepository
    {
        public DailyStoryReadLogRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<int> GetDistinctStoryCountForDateAsync(
            Guid userId, DateTime readDate, CancellationToken cancellationToken = default) =>
            await DbSet.CountAsync(l => l.AppUserId == userId && l.ReadDate == readDate.Date, cancellationToken);

        public async Task<bool> ExistsAsync(
            Guid userId, Guid storyId, DateTime readDate, CancellationToken cancellationToken = default) =>
            await DbSet.AnyAsync(
                l => l.AppUserId == userId && l.StoryId == storyId && l.ReadDate == readDate.Date, cancellationToken);
    }
}
