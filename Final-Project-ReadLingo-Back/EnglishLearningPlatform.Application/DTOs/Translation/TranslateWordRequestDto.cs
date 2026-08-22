using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Translation
{
    public class TranslateWordRequestDto
    {
        public string Word { get; set; } = string.Empty;
        public string? ContextSentence { get; set; }
        public string TargetLanguage { get; set; } = "az";
    }
}
