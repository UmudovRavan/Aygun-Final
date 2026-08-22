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
    public class WordDefinitionRepository : GenericRepository<WordDefinition>, IWordDefinitionRepository
    {
        public WordDefinitionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<WordDefinition>> GetByVocabularyIdAsync(Guid vocabularyId, CancellationToken cancellationToken = default) =>
            await DbSet.Where(d => d.VocabularyId == vocabularyId).ToListAsync(cancellationToken);
    }
}
