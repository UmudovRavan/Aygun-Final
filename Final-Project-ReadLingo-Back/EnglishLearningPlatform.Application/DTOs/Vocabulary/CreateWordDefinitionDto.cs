using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Vocabulary
{
    public class CreateWordDefinitionDto
    {
        public string Definition { get; set; } = string.Empty;

        public string? PartOfSpeech { get; set; }

        public string? ExampleSentence { get; set; }

        public string? Language { get; set; }
    }
}
