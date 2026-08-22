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
    public class DailyStoryReadLogConfiguration : IEntityTypeConfiguration<DailyStoryReadLog>
    {
        public void Configure(EntityTypeBuilder<DailyStoryReadLog> builder)
        {
            builder.ToTable("DailyStoryReadLogs");

            builder.HasIndex(l => new { l.AppUserId, l.StoryId, l.ReadDate }).IsUnique();

            builder.HasOne(l => l.AppUser)
                .WithMany(u => u.DailyStoryReadLogs)
                .HasForeignKey(l => l.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(l => l.Story)
                .WithMany()
                .HasForeignKey(l => l.StoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
