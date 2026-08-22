using System;

namespace EnglishLearningPlatform.Application.DTOs.Chat
{
    public class ChatUsageDto
    {
        public string Tier { get; set; } = "Free";
        public int UsedToday { get; set; }
        public int DailyLimit { get; set; }
        public bool IsUnlimited { get; set; }
        public int Remaining { get; set; }
    }
}
