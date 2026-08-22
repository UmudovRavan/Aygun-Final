using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Support
{
    public class SupportTicketDto
    {
        public Guid Id { get; set; }

        public Guid AppUserId { get; set; }

        public string? UserEmail { get; set; }

        public string Subject { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public SupportTicketStatus Status { get; set; }

        public SupportTicketPriority Priority { get; set; }

        public string? AdminResponse { get; set; }

        public DateTime? ResolvedAt { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
