using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.AI
{
    public class GeneratedStandaloneQuizDto
    {
        public string Topic { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public List<GeneratedStandaloneQuestionDto> Questions { get; set; } = new();
    }
}
