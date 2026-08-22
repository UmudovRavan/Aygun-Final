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

    public class ChapterConfiguration : IEntityTypeConfiguration<Chapter>
    {
        public void Configure(EntityTypeBuilder<Chapter> builder)
        {
            builder.ToTable("Chapters");

            builder.Property(c => c.Title).HasMaxLength(200).IsRequired();
            builder.Property(c => c.Content).IsRequired();
            builder.Property(c => c.AudioUrl).HasMaxLength(500);

            builder.HasIndex(c => new { c.StoryId, c.Order });

            builder.HasOne(c => c.Story)
                .WithMany(s => s.Chapters)
                .HasForeignKey(c => c.StoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.Vocabularies)
                .WithOne(v => v.Chapter)
                .HasForeignKey(v => v.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.Quizzes)
                .WithOne(q => q.Chapter)
                .HasForeignKey(q => q.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.Bookmarks)
                .WithOne(b => b.Chapter)
                .HasForeignKey(b => b.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.ReadingHistories)
                .WithOne(h => h.Chapter)
                .HasForeignKey(h => h.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.UserProgresses)
                .WithOne(p => p.Chapter)
                .HasForeignKey(p => p.ChapterId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }

}
