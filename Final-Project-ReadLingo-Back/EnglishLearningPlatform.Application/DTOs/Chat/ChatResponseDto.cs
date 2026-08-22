using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Chat
{
    public class ChatResponseDto
    {
        public Guid ConversationId { get; set; }
        public string Reply { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
