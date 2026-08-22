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
    public class AIQuizGenerationHistoryConfiguration : IEntityTypeConfiguration<AIQuizGenerationHistory>
    {
        public void Configure(EntityTypeBuilder<AIQuizGenerationHistory> builder)
        {
            builder.ToTable("AIQuizGenerationHistories");

            builder.Property(h => h.Topic).HasMaxLength(200);
            builder.Property(h => h.Level).HasMaxLength(10);

            builder.HasIndex(h => new { h.AppUserId, h.CreatedAt });

            builder.HasOne(h => h.AppUser)
                .WithMany(u => u.AIQuizGenerationHistories)
                .HasForeignKey(h => h.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
