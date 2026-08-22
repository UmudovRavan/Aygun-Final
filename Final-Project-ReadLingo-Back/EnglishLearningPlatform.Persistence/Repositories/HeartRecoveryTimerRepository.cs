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
    public class HeartRecoveryTimerRepository : GenericRepository<HeartRecoveryTimer>, IHeartRecoveryTimerRepository
    {
        public HeartRecoveryTimerRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<HeartRecoveryTimer>> GetPendingByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet
                .Where(t => t.AppUserId == userId && !t.IsRecovered)
                .OrderBy(t => t.RecoverAt)
                .ToListAsync(cancellationToken);
    }
}
