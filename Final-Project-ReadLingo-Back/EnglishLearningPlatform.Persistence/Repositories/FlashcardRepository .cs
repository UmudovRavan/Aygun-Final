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
    public class FlashcardRepository : GenericRepository<Flashcard>, IFlashcardRepository
    {
        public FlashcardRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Flashcard>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(f => f.Vocabulary).Where(f => f.AppUserId == userId).ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<Flashcard>> GetDueForReviewAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(f => f.Vocabulary)
                .Where(f => f.AppUserId == userId && (f.NextReviewDate == null || f.NextReviewDate <= DateTime.UtcNow))
                .ToListAsync(cancellationToken);
    }
}
