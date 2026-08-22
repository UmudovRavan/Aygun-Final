using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IWordDefinitionRepository : IGenericRepository<WordDefinition>
    {
        Task<IReadOnlyList<WordDefinition>> GetByVocabularyIdAsync(Guid vocabularyId, CancellationToken cancellationToken = default);
    }
}
