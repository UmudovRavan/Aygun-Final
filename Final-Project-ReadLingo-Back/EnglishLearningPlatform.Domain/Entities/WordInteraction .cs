using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class WordInteraction : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid? VocabularyId { get; set; }
        public Vocabulary? Vocabulary { get; set; }

        public WordInteractionType InteractionType { get; set; }
        public Guid? WordTranslationId { get; set; }
        public WordTranslation? WordTranslation { get; set; }

        public Guid? ChapterId { get; set; }
        public Chapter? Chapter { get; set; }
    }
}
