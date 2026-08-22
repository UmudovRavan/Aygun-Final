using EnglishLearningPlatform.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Story
{

    public class StoryQueryParameters : QueryParameters
    {
        public Guid? StoryCategoryId { get; set; }

        public Guid? StoryLevelId { get; set; }

        public bool? IsPublished { get; set; }

        public string? Language { get; set; }
    }
}
