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
    public class FlashcardProgressRepository : GenericRepository<FlashcardProgress>, IFlashcardProgressRepository
    {
        public FlashcardProgressRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<FlashcardProgress?> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(p => p.AppUserId == userId, cancellationToken);
    }
}
