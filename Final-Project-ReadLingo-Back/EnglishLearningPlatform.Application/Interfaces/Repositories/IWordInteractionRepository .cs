using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IWordInteractionRepository : IGenericRepository<WordInteraction>
    {
        Task<IReadOnlyDictionary<Guid, int>> GetInteractionCountsAsync(
            Guid userId, IEnumerable<Guid> vocabularyIds, CancellationToken cancellationToken = default);
    }
}
