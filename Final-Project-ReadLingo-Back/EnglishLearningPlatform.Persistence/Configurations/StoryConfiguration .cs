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

    public class StoryConfiguration : IEntityTypeConfiguration<Story>
    {
        public void Configure(EntityTypeBuilder<Story> builder)
        {
            builder.ToTable("Stories");

            builder.Property(s => s.Title).HasMaxLength(200).IsRequired();
            builder.Property(s => s.Description).HasMaxLength(2000);
            builder.Property(s => s.CoverImageUrl).HasColumnType("nvarchar(max)");
            builder.Property(s => s.Language).HasMaxLength(50);

            builder.HasQueryFilter(s => !s.IsDeleted);
            builder.HasIndex(s => s.Title);
            builder.HasIndex(s => s.IsPublished);

            builder.HasOne(s => s.StoryCategory)
                .WithMany(c => c.Stories)
                .HasForeignKey(s => s.StoryCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.StoryLevel)
                .WithMany(l => l.Stories)
                .HasForeignKey(s => s.StoryLevelId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-many: Story -> Chapters
            builder.HasMany(s => s.Chapters)
                .WithOne(c => c.Story)
                .HasForeignKey(c => c.StoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-many: Story -> Reviews
            builder.HasMany(s => s.Reviews)
                .WithOne(r => r.Story)
                .HasForeignKey(r => r.StoryId)
                .OnDelete(DeleteBehavior.Cascade);

         
            builder.HasMany(s => s.UserProgresses)
                .WithOne(p => p.Story)
                .HasForeignKey(p => p.StoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.ReadingHistories)
                .WithOne(h => h.Story)
                .HasForeignKey(h => h.StoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.FavoriteStories)
                .WithOne(f => f.Story)
                .HasForeignKey(f => f.StoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
