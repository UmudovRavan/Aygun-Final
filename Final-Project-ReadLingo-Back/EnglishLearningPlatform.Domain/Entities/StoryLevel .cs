using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class StoryLevel : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public StoryLevelRank Rank { get; set; }
        public string? Description { get; set; }
        public int Order { get; set; }

        public ICollection<Story> Stories { get; set; } = new List<Story>();
    }
}
