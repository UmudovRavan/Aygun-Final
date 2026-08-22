using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IWordTranslationRepository : IGenericRepository<WordTranslation>
    {
        Task<WordTranslation?> GetByLemmaAsync(string lemma, string targetLanguage, CancellationToken cancellationToken = default);
    }
}
