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

    public class ReadingHistoryConfiguration : IEntityTypeConfiguration<ReadingHistory>
    {
        public void Configure(EntityTypeBuilder<ReadingHistory> builder)
        {
            builder.ToTable("ReadingHistories");

            builder.HasIndex(h => new { h.AppUserId, h.ChapterId });

            builder.HasOne(h => h.AppUser)
                .WithMany(u => u.ReadingHistories)
                .HasForeignKey(h => h.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

         
            builder.HasOne(h => h.Story)
                .WithMany(s => s.ReadingHistories)
                .HasForeignKey(h => h.StoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(h => h.Chapter)
                .WithMany(c => c.ReadingHistories)
                .HasForeignKey(h => h.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
