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
    public class RemainingCorrectCounterConfiguration : IEntityTypeConfiguration<RemainingCorrectCounter>
    {
        public void Configure(EntityTypeBuilder<RemainingCorrectCounter> builder)
        {
            builder.ToTable("RemainingCorrectCounters");

            builder.HasIndex(c => new { c.AppUserId, c.StoryId }).IsUnique();

            builder.HasOne(c => c.AppUser)
                .WithMany(u => u.RemainingCorrectCounters)
                .HasForeignKey(c => c.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(c => c.Story)
                .WithMany()
                .HasForeignKey(c => c.StoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
