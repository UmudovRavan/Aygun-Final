using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class Payment : AuditableEntity
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public PaymentMethod Method { get; set; }
        public string? TransactionId { get; set; }
        public string? ProviderReference { get; set; }

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;

        public Guid SubscriptionId { get; set; }
        public Subscription Subscription { get; set; } = null!;
    }

}
