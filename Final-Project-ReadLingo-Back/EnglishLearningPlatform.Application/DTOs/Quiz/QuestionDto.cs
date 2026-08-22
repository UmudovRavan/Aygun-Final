using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class QuestionDto
    {
        public Guid Id { get; set; }

        public string Text { get; set; } = string.Empty;

        public QuestionType QuestionType { get; set; }

        public int Order { get; set; }

        public List<AnswerDto> Answers { get; set; } = new();
        public string? CorrectAnswer { get; set; }
        public string? Explanation { get; set; }
        public QuestionCategory Category { get; set; }
        public int TimeLimitSeconds { get; set; } = 15;
        public TranslationDirection Direction { get; set; }
    }
}
