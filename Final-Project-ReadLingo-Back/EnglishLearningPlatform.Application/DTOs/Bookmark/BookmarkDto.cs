using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Bookmark
{
    public class BookmarkDto
    {
        public Guid Id { get; set; }

        public Guid ChapterId { get; set; }

        public string? ChapterTitle { get; set; }

        public string? Note { get; set; }

        public double PositionPercentage { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
