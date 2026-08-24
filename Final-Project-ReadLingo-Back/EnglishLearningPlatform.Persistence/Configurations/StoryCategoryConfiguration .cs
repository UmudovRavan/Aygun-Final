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

    public class StoryCategoryConfiguration : IEntityTypeConfiguration<StoryCategory>
    {
        public void Configure(EntityTypeBuilder<StoryCategory> builder)
        {
            builder.ToTable("StoryCategories");

            builder.Property(c => c.Name).HasMaxLength(100).IsRequired();
            builder.Property(c => c.Description).HasMaxLength(500);
            builder.Property(c => c.IconUrl).HasColumnType("nvarchar(max)");

            builder.HasIndex(c => c.Name).IsUnique();

            builder.HasMany(c => c.Stories)
                .WithOne(s => s.StoryCategory)
                .HasForeignKey(s => s.StoryCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
