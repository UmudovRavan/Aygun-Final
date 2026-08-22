using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Repositories
{
    public class WordInteractionRepository : GenericRepository<WordInteraction>, IWordInteractionRepository
    {
        public WordInteractionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyDictionary<Guid, int>> GetInteractionCountsAsync(
            Guid userId, IEnumerable<Guid> vocabularyIds, CancellationToken cancellationToken = default)
        {
            if (vocabularyIds == null || !vocabularyIds.Any())
            {
                return new Dictionary<Guid, int>();
            }

            var ids = vocabularyIds.ToList();

            var counts = await DbSet
                .AsNoTracking()
                .Where(w => w.AppUserId == userId
                            && w.VocabularyId.HasValue
                            && ids.Contains(w.VocabularyId.Value))
                .GroupBy(w => w.VocabularyId.Value)
                .Select(g => new { VocabularyId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.VocabularyId, x => x.Count, cancellationToken);

            return counts;
        }
    }
}