using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Chapter
{
    public class ReadAloudDto
    {
        public Guid ChapterId { get; set; }
        public string FullText { get; set; } = string.Empty;
        public List<string> Sentences { get; set; } = new();

      
        public string LanguageCode { get; set; } = "en-US";
        public string? VoiceId { get; set; }
    }
}
