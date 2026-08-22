using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Bookmark
{
    public class CreateBookmarkDto
    {
        public Guid ChapterId { get; set; }

        public string? Note { get; set; }

        public double PositionPercentage { get; set; }
    }
}
