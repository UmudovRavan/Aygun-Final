using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class AIQuizGenerationHistory : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public string Topic { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public int WordCount { get; set; }
        public int QuestionCount { get; set; }

        public string RawResponse { get; set; } = string.Empty;
    }
}
