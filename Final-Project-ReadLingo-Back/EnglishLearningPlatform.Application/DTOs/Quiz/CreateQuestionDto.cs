using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class CreateQuestionDto
    {
        public string Text { get; set; } = string.Empty;

        public QuestionType QuestionType { get; set; }

        public int Order { get; set; }

        public List<CreateAnswerDto> Answers { get; set; } = new();
    }
}
