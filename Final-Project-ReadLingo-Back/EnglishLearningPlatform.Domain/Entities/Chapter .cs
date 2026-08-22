using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class Chapter : AuditableEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? AudioUrl { get; set; }
        public int Order { get; set; }

        
        public Guid StoryId { get; set; }
        public Story Story { get; set; } = null!;

      
        public ICollection<Vocabulary> Vocabularies { get; set; } = new List<Vocabulary>();
        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public ICollection<ReadingHistory> ReadingHistories { get; set; } = new List<ReadingHistory>();
        public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
    }

}
