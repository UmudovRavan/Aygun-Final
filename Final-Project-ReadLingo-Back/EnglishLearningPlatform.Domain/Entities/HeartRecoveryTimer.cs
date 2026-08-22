using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class HeartRecoveryTimer : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public DateTime LostAt { get; set; } = DateTime.UtcNow;
        public DateTime RecoverAt { get; set; }
        public bool IsRecovered { get; set; }
    }
}
