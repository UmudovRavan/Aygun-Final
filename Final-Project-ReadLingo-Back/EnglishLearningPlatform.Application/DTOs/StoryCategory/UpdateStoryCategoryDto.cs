using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.StoryCategory
{
    public class UpdateStoryCategoryDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? IconUrl { get; set; }
    }
}
