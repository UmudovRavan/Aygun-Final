using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class QuizAttemptDto
    {
        public Guid Id { get; set; }
        public Guid StoryId { get; set; }
        public Guid ChapterId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int DurationSeconds { get; set; }
        public int CorrectAnswers { get; set; }
        public int IncorrectAnswers { get; set; }
        public int XpEarned { get; set; }
        public int RemainingHearts { get; set; }
        public bool CanProceedToNextChapter { get; set; }
        public DateTime? NextHeartAvailableAt { get; set; }
        public List<QuestionResultDto> QuestionResults { get; set; } = new();
    }
}
