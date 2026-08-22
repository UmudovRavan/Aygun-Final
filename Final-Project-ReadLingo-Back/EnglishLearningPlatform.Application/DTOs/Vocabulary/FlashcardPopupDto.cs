using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Vocabulary
{
    public class FlashcardPopupDto
    {
        public Guid VocabularyId { get; set; }
        public string Word { get; set; } = string.Empty;

        public string? Translation { get; set; }
        public string? PronunciationAudioUrl { get; set; }
        public string? PartOfSpeech { get; set; }
        public string? ExampleSentence { get; set; }

        public int CurrentIndex { get; set; }
        public int TotalCount { get; set; }
    }
}
