using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class FavoriteStory : AuditableEntity
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid StoryId { get; set; }
        public Story Story { get; set; } = null!;
    }

}
