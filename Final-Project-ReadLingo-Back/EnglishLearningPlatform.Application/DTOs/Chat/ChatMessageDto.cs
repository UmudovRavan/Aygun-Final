using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Chat
{
    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public string UserMessage { get; set; } = string.Empty;
        public string AIResponse { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
