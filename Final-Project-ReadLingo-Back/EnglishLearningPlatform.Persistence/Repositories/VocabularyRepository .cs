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
    public class VocabularyRepository : GenericRepository<Vocabulary>, IVocabularyRepository
    {
        public VocabularyRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Vocabulary>> GetByChapterIdAsync(Guid chapterId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(v => v.WordDefinitions).Where(v => v.ChapterId == chapterId).ToListAsync(cancellationToken);
    }
}
