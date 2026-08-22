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
    public class QuizAttemptRepository : GenericRepository<QuizAttempt>, IQuizAttemptRepository
    {
        public QuizAttemptRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<QuizAttempt?> GetActiveAttemptAsync(
            Guid userId, Guid chapterId, CancellationToken cancellationToken = default) =>
            await DbSet
                .Where(a => a.AppUserId == userId && a.ChapterId == chapterId && a.CompletedAt == null)
                .OrderByDescending(a => a.StartedAt)
                .FirstOrDefaultAsync(cancellationToken);

        public async Task<IReadOnlyList<QuizAttempt>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet
                .Include(a => a.Story)
                .Include(a => a.Chapter)
                .Where(a => a.AppUserId == userId)
                .OrderByDescending(a => a.StartedAt)
                .ToListAsync(cancellationToken);
    }
}
