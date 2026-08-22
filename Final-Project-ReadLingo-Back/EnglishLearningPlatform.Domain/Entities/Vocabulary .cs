using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class Vocabulary : AuditableEntity
    {
        public string Word { get; set; } = string.Empty;
        public string? Pronunciation { get; set; }
        public string? ImageUrl { get; set; }
        public string? AudioUrl { get; set; }

        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; } = null!;

        public ICollection<WordDefinition> WordDefinitions { get; set; } = new List<WordDefinition>();

        public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
    }
}
