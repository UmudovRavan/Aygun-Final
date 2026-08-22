using System;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class RecordQuizResultDto
    {
        public Guid StoryId { get; set; }
        public Guid? ChapterId { get; set; }
        public int CorrectAnswers { get; set; }
        public int IncorrectAnswers { get; set; }
        public int XpEarned { get; set; }
        public int RemainingHearts { get; set; }
    }
}
