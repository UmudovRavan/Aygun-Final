using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class ReadingHistory : AuditableEntity
    {
        public DateTime LastReadAt { get; set; } = DateTime.UtcNow;
        public double ReadingPositionPercentage { get; set; }
       
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid StoryId { get; set; }
        public Story Story { get; set; } = null!;

        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; } = null!;
    }
}
