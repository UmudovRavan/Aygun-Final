using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Vocabulary
{
    public class VocabularyDto
    {
        public Guid Id { get; set; }

        public Guid ChapterId { get; set; }

        public string Word { get; set; } = string.Empty;

        public string? Pronunciation { get; set; }

        public string? ImageUrl { get; set; }

        public string? AudioUrl { get; set; }

        public List<WordDefinitionDto> Definitions { get; set; } = new();
    }
}
