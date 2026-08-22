using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Progress
{
    public class UpsertUserProgressDto
    {
        public Guid StoryId { get; set; }
        public Guid? ChapterId { get; set; }
        public double ProgressPercentage { get; set; }
        public bool IsCompleted { get; set; }
    }
}
