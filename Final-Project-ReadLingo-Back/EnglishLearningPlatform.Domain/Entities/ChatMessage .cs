using EnglishLearningPlatform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class ChatMessage : AuditableEntity
    {
        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid ConversationId { get; set; }
        public ChatConversation Conversation { get; set; } = null!;

        public string UserMessage { get; set; } = string.Empty;
        public string AIResponse { get; set; } = string.Empty;
    }
}
