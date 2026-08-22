using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class Quiz : AuditableEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PassingScore { get; set; }

        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; } = null!;

        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
