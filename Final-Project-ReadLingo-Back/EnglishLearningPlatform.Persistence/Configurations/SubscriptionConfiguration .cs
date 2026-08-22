using EnglishLearningPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishLearningPlatform.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.Property(s => s.PlanName).HasMaxLength(100).IsRequired();
        builder.Property(s => s.PlanType).HasConversion<string>().HasMaxLength(20);
        builder.Property(s => s.Tier).HasConversion<string>().HasMaxLength(20);
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(s => s.Price).HasColumnType("decimal(18,2)");
        builder.Property(s => s.Currency).HasMaxLength(10);

        builder.Property(s => s.StripeCustomerId).HasMaxLength(100);
        builder.Property(s => s.StripeSubscriptionId).HasMaxLength(100);
        builder.Property(s => s.StripeSessionId).HasMaxLength(200);

        builder.HasIndex(s => new { s.AppUserId, s.IsActive });
        builder.HasIndex(s => s.StripeCustomerId);
        builder.HasIndex(s => s.StripeSubscriptionId).IsUnique().HasFilter("[StripeSubscriptionId] IS NOT NULL");

        builder.HasOne(s => s.AppUser)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(s => s.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Payments)
            .WithOne(p => p.Subscription)
            .HasForeignKey(p => p.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}