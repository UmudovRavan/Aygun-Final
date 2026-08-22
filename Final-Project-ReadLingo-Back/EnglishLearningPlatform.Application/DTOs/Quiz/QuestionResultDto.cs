using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class QuestionResultDto
    {
        public Guid QuestionId { get; set; }
        public bool WasCorrect { get; set; }
        public bool TimedOut { get; set; }
        public Guid CorrectAnswerId { get; set; }
        public string CorrectAnswerText { get; set; } = string.Empty;
    }
}
