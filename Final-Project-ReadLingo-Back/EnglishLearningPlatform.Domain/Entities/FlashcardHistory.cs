using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class FlashcardHistory : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid VocabularyId { get; set; }
        public Vocabulary Vocabulary { get; set; } = null!;

        public DateTime ShownAt { get; set; } = DateTime.UtcNow;
    }
}
