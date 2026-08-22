using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.AI
{
    public class AISettings
    {
        public const string SectionName = "AI";

        public string Provider { get; set; } = "None";
        public string BaseUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 30;
    }
}
