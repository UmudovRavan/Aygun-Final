using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Chat
{
    public class ChatRequestDto
    {
        public Guid? ConversationId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
