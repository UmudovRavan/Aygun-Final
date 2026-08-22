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

    public class FavoriteStoryConfiguration : IEntityTypeConfiguration<FavoriteStory>
    {
        public void Configure(EntityTypeBuilder<FavoriteStory> builder)
        {
            builder.ToTable("FavoriteStories");

            builder.HasIndex(f => new { f.AppUserId, f.StoryId }).IsUnique();

            builder.HasOne(f => f.AppUser)
                .WithMany(u => u.FavoriteStories)
                .HasForeignKey(f => f.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Story)
                .WithMany(s => s.FavoriteStories)
                .HasForeignKey(f => f.StoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
