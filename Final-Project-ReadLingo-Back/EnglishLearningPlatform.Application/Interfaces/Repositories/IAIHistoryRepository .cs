using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IAIHistoryRepository : IGenericRepository<AIHistory>
    {
        Task<IReadOnlyList<AIHistory>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
