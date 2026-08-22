using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class Bookmark : AuditableEntity
    {
        public string? Note { get; set; }
        public double PositionPercentage { get; set; }

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
        
        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; } = null!;
    }

}
