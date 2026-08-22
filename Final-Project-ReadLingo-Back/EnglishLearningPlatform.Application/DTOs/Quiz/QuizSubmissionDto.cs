using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class QuizSubmissionDto
    {
        public List<QuestionAnswerSubmissionDto> Answers { get; set; } = new();
    }

    public class QuestionAnswerSubmissionDto
    {
        public Guid QuestionId { get; set; }

        public Guid? SelectedAnswerId { get; set; }
    }

    public class QuizResultDto
    {
        public Guid QuizId { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public double ScorePercentage { get; set; }
        public bool Passed { get; set; }
    }
}
