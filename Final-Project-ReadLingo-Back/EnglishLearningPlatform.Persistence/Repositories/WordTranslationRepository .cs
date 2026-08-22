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
    public class WordTranslationRepository : GenericRepository<WordTranslation>, IWordTranslationRepository
    {
        public WordTranslationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<WordTranslation?> GetByLemmaAsync(
            string lemma, string targetLanguage, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(
                w => w.Lemma == lemma && w.TargetLanguage == targetLanguage, cancellationToken);
    }
}
