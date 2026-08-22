using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Quiz
{
    public class HeartStatusDto
    {
        public int Hearts { get; set; }
        public int MaxHearts { get; set; }
        public bool IsUnlimited { get; set; }

        public List<DateTime> PendingRecoveryTimes { get; set; } = new();
    }
}
