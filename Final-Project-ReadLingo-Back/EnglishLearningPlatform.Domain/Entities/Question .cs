using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class Question : AuditableEntity
    {
        public string Text { get; set; } = string.Empty;
        public QuestionType QuestionType { get; set; }
        public int Order { get; set; }

        public Guid QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;

        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public int? TimeLimitSeconds { get; set; }
    }
}
