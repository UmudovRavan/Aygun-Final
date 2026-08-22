using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class WordDefinition : AuditableEntity
    {
        public string Definition { get; set; } = string.Empty;
        public string? PartOfSpeech { get; set; }
        public string? ExampleSentence { get; set; }
        public string? Language { get; set; }

        public Guid VocabularyId { get; set; }
        public Vocabulary Vocabulary { get; set; } = null!;
    }
}

