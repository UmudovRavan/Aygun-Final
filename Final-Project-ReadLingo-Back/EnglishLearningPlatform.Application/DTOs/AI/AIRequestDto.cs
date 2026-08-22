using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.AI
{
    public class AIRequestDto
    {
        public AIFeatureType FeatureType { get; set; }
        public string Prompt { get; set; } = string.Empty;
    }
}
