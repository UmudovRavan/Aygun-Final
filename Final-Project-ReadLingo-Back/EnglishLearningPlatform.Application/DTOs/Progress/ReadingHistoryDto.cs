using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Progress
{
    public class ReadingHistoryDto
    {
        public Guid Id { get; set; }
        public Guid StoryId { get; set; }
        public string? StoryTitle { get; set; }
        public Guid ChapterId { get; set; }
        public string? ChapterTitle { get; set; }
        public double ReadingPositionPercentage { get; set; }
        public DateTime LastReadAt { get; set; }
    }
}
