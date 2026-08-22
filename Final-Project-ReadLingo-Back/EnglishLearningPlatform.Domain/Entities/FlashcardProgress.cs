using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class FlashcardProgress : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid? LastShownVocabularyId { get; set; }
        public Vocabulary? LastShownVocabulary { get; set; }

        public int CompletedCycles { get; set; }
    }
}
