using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class WordTranslation : AuditableEntity
    {
        public string Lemma { get; set; } = string.Empty;

        public string TargetLanguage { get; set; } = "az";

        public string Translation { get; set; } = string.Empty;

        public string? PartOfSpeech { get; set; }

        public ICollection<WordInteraction> WordInteractions { get; set; } = new List<WordInteraction>();
    }
}
