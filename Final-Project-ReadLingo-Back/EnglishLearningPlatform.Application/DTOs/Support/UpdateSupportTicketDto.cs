using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Support
{
   
    public class UpdateSupportTicketDto
    {
        public SupportTicketStatus Status { get; set; }

        public SupportTicketPriority Priority { get; set; }

        public string? AdminResponse { get; set; }
    }
}
