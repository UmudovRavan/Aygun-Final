using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Subscription
{
    public class CreateSubscriptionDto
    {
        public string PlanName { get; set; } = string.Empty;
        public SubscriptionPlanType PlanType { get; set; }
        public bool AutoRenew { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public PaymentMethod PaymentMethod { get; set; }
    }
}
