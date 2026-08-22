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
    public class QuizRepository : GenericRepository<Quiz>, IQuizRepository
    {
        public QuizRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Quiz>> GetByChapterIdAsync(Guid chapterId, CancellationToken cancellationToken = default) =>
            await DbSet.Where(q => q.ChapterId == chapterId).ToListAsync(cancellationToken);

        public async Task<Quiz?> GetWithQuestionsAndAnswersAsync(Guid id, CancellationToken cancellationToken = default) =>
            await DbSet
                .Include(q => q.Questions).ThenInclude(qq => qq.Answers)
                .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
    }
}
