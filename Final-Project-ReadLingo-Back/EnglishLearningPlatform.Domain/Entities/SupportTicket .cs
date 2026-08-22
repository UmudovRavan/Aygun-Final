using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class SupportTicket : AuditableEntity
    {
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public SupportTicketStatus Status { get; set; } = SupportTicketStatus.Open;
        public SupportTicketPriority Priority { get; set; } = SupportTicketPriority.Medium;
        public DateTime? ResolvedAt { get; set; }
        public string? AdminResponse { get; set; }

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
    }
}
