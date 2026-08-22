using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class QuizAttempt : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid StoryId { get; set; }
        public Story Story { get; set; } = null!;

        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; } = null!;

        public Guid? QuizId { get; set; }
        public Quiz? Quiz { get; set; }

        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int DurationSeconds { get; set; }

        public int CorrectAnswers { get; set; }
        public int IncorrectAnswers { get; set; }
        public int XpEarned { get; set; }
        public int RemainingHearts { get; set; }
    }
}
