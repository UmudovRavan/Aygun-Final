using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{

    public class Subscription : AuditableEntity
    {
        public string PlanName { get; set; } = string.Empty;
        public SubscriptionPlanType PlanType { get; set; }
        public SubscriptionTier Tier { get; set; } = SubscriptionTier.Free;
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public bool AutoRenew { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

        public string? StripeCustomerId { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public string? StripeSessionId { get; set; }
    }

}
