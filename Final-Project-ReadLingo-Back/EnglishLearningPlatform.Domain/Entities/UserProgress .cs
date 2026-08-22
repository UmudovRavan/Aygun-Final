using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class UserProgress : AuditableEntity
    {
        public double ProgressPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid StoryId { get; set; }
        public Story Story { get; set; } = null!;

        public Guid? ChapterId { get; set; }
        public Chapter? Chapter { get; set; }
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    }
}
