using EnglishLearningPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Configurations
{

    public class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
    {
        public void Configure(EntityTypeBuilder<SupportTicket> builder)
        {
            builder.ToTable("SupportTickets");

            builder.Property(t => t.Subject).HasMaxLength(200).IsRequired();
            builder.Property(t => t.Message).HasMaxLength(2000).IsRequired();
            builder.Property(t => t.AdminResponse).HasMaxLength(2000);
            builder.Property(t => t.Status).HasConversion<string>().HasMaxLength(50);
            builder.Property(t => t.Priority).HasConversion<string>().HasMaxLength(50);

            builder.HasIndex(t => t.Status);

            builder.HasOne(t => t.AppUser)
                .WithMany(u => u.SupportTickets)
                .HasForeignKey(t => t.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
