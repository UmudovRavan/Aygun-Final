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
    public class FlashcardHistoryRepository : GenericRepository<FlashcardHistory>, IFlashcardHistoryRepository
    {
        public FlashcardHistoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<FlashcardHistory>> GetByUserIdAsync(
            Guid userId, int limit, CancellationToken cancellationToken = default) =>
            await DbSet
                .Where(h => h.AppUserId == userId)
                .OrderByDescending(h => h.ShownAt)
                .Take(limit)
                .ToListAsync(cancellationToken);
    }
}
