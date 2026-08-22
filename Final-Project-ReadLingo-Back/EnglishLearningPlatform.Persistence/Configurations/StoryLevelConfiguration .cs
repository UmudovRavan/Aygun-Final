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

    public class StoryLevelConfiguration : IEntityTypeConfiguration<StoryLevel>
    {
        public void Configure(EntityTypeBuilder<StoryLevel> builder)
        {
            builder.ToTable("StoryLevels");

            builder.Property(l => l.Name).HasMaxLength(100).IsRequired();
            builder.Property(l => l.Description).HasMaxLength(500);

            builder.HasIndex(l => l.Name).IsUnique();

            builder.HasMany(l => l.Stories)
                .WithOne(s => s.StoryLevel)
                .HasForeignKey(s => s.StoryLevelId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
