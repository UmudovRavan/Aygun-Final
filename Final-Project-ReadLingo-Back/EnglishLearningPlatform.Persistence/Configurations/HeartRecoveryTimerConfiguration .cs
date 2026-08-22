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
    public class HeartRecoveryTimerConfiguration : IEntityTypeConfiguration<HeartRecoveryTimer>
    {
        public void Configure(EntityTypeBuilder<HeartRecoveryTimer> builder)
        {
            builder.ToTable("HeartRecoveryTimers");

            builder.HasIndex(t => new { t.AppUserId, t.IsRecovered, t.RecoverAt });

            builder.HasOne(t => t.AppUser)
                .WithMany(u => u.HeartRecoveryTimers)
                .HasForeignKey(t => t.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
