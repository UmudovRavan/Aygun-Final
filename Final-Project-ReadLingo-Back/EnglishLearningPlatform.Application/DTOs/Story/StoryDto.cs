using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Story
{

    public class StoryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Language { get; set; }
        public bool IsPublished { get; set; }
        public int EstimatedMinutes { get; set; }
        public Guid StoryCategoryId { get; set; }
        public string? StoryCategoryName { get; set; }
        public Guid StoryLevelId { get; set; }
        public string? StoryLevelName { get; set; }
        public double AverageRating { get; set; }
        public int ChapterCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
