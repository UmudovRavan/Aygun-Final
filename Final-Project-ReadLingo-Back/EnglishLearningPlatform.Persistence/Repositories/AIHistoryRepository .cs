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
    public class AIHistoryRepository : GenericRepository<AIHistory>, IAIHistoryRepository
    {
        public AIHistoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<AIHistory>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Where(a => a.AppUserId == userId).OrderByDescending(a => a.CreatedAt).ToListAsync(cancellationToken);
    }
}
