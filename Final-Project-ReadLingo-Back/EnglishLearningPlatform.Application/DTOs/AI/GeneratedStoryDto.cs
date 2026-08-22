using EnglishLearningPlatform.Application.DTOs.Chapter;
using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.DTOs.Story;
using EnglishLearningPlatform.Application.DTOs.Vocabulary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.AI
{

    public class GeneratedStoryDto
    {
        public StoryDto Story { get; set; } = null!;
        public List<ChapterDto> Chapters { get; set; } = new();
        public List<VocabularyDto> Vocabulary { get; set; } = new();
        public QuizDto? Quiz { get; set; }
    }
}
