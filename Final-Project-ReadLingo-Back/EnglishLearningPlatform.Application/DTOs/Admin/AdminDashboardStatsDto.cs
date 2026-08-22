using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Admin
{

    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }

        public int ActiveSubscriptions { get; set; }

        public int TotalStories { get; set; }

        public int PublishedStories { get; set; }

        public int OpenSupportTickets { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}
