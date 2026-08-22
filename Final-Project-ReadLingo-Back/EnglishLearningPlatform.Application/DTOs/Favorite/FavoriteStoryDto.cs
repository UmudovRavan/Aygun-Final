using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Favorite
{
    public class FavoriteStoryDto
    {
        public Guid Id { get; set; }

        public Guid StoryId { get; set; }

        public string StoryTitle { get; set; } = string.Empty;

        public string? StoryCoverImageUrl { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
