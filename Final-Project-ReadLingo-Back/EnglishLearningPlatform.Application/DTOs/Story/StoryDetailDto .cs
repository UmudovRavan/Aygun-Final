using EnglishLearningPlatform.Application.DTOs.Chapter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Story
{
    public class StoryDetailDto : StoryDto
    {
        public List<ChapterSummaryDto> Chapters { get; set; } = new();
    }
}
