using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Support
{
    public class CreateSupportTicketDto
    {
        public string Subject { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public SupportTicketPriority Priority { get; set; } = SupportTicketPriority.Medium;
    }
}
