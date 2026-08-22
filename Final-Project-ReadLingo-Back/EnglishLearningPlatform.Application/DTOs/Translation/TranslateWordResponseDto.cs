using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Translation
{
    public class TranslateWordResponseDto
    {
        public string OriginalWord { get; set; } = string.Empty;
        public string Lemma { get; set; } = string.Empty;
        public string Translation { get; set; } = string.Empty;
        public string? PartOfSpeech { get; set; }
        public string? DefinitionEn { get; set; }
        public string? DefinitionAz { get; set; }
        public string? ContextSentence { get; set; }
        public string? Pronunciation { get; set; }
        public bool WasCached { get; set; }
    }
}
