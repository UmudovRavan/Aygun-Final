using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class AnswerDto
    {
        public Guid Id { get; set; }

        public string Text { get; set; } = string.Empty;

        public int Order { get; set; }

      
        public bool? IsCorrect { get; set; }
    }
}
