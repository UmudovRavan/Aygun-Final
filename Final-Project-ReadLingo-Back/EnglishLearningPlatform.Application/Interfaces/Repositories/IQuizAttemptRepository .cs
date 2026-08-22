using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IQuizAttemptRepository : IGenericRepository<QuizAttempt>
    {
        Task<QuizAttempt?> GetActiveAttemptAsync(Guid userId, Guid chapterId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<QuizAttempt>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
