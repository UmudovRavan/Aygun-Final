using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.AI
{
    public class GenerateStoryRequestDto
    {
        public string Prompt { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public int WordCount { get; set; }
        public int QuizQuestionCount { get; set; }
    }
}
