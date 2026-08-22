using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Chapter
{
    public class CreateChapterDto
    {
        public Guid StoryId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public string? AudioUrl { get; set; }

        public int Order { get; set; }
    }
}
