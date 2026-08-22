using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class AIHistory : AuditableEntity
    {
        public AIFeatureType FeatureType { get; set; }
        public string Prompt { get; set; } = string.Empty;
        public string Response { get; set; } = string.Empty;
        public int? TokensUsed { get; set; }

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
    }
}
