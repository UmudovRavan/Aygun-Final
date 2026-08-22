using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Progress
{
    public class RecordReadingDto
    {
        public Guid StoryId { get; set; }
        public Guid ChapterId { get; set; }
        public double ReadingPositionPercentage { get; set; }
    }
}
