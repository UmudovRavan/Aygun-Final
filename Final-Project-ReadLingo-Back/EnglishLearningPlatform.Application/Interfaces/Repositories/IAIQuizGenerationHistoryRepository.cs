using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IAIQuizGenerationHistoryRepository : IGenericRepository<AIQuizGenerationHistory>
    {
        Task<IReadOnlyList<AIQuizGenerationHistory>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default);
    }
}
