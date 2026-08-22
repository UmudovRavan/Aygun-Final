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
    public class AIQuizGenerationHistoryRepository : GenericRepository<AIQuizGenerationHistory>, IAIQuizGenerationHistoryRepository
    {
        public AIQuizGenerationHistoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<AIQuizGenerationHistory>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet
                .Where(h => h.AppUserId == userId)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync(cancellationToken);
    }
}
