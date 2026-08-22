using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class CreateQuizDto
    {
        public Guid ChapterId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int PassingScore { get; set; }

        public List<CreateQuestionDto> Questions { get; set; } = new();
    }
}
