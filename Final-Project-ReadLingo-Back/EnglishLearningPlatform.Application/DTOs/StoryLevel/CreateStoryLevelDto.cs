using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.StoryLevel
{
    public class CreateStoryLevelDto
    {
        public string Name { get; set; } = string.Empty;

        public StoryLevelRank Rank { get; set; }

        public string? Description { get; set; }

        public int Order { get; set; }
    }
}
