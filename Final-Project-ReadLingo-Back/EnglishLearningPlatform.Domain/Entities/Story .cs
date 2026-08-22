using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class Story : AuditableEntity, ISoftDelete
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Language { get; set; }
        public bool IsPublished { get; set; }
        public int EstimatedMinutes { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        public Guid StoryCategoryId { get; set; }
        public StoryCategory StoryCategory { get; set; } = null!;

        public Guid StoryLevelId { get; set; }
        public StoryLevel StoryLevel { get; set; } = null!;

        public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
        public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
        public ICollection<ReadingHistory> ReadingHistories { get; set; } = new List<ReadingHistory>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<FavoriteStory> FavoriteStories { get; set; } = new List<FavoriteStory>();
    }
}
