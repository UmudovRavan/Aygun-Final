using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Subscription
{
    public class SubscriptionDto
    {
        public Guid Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public SubscriptionPlanType PlanType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool AutoRenew { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
    }
}
