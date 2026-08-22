using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.AI
{
    public class GenerateStandaloneQuizRequestDto
    {
        public string Topic { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public int WordCount { get; set; } = 500;
        public int QuestionCount { get; set; } = 5;
    }
}
