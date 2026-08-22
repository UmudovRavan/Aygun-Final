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
    public class AnswerRepository : GenericRepository<Answer>, IAnswerRepository
    {
        public AnswerRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Answer>> GetByQuestionIdAsync(Guid questionId, CancellationToken cancellationToken = default) =>
            await DbSet.Where(a => a.QuestionId == questionId).OrderBy(a => a.Order).ToListAsync(cancellationToken);
    }
}
