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

    public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
    {
        public void Configure(EntityTypeBuilder<UserProgress> builder)
        {
            builder.ToTable("UserProgresses");

            builder.HasIndex(p => new { p.AppUserId, p.StoryId }).IsUnique();

            builder.HasOne(p => p.AppUser)
                .WithMany(u => u.UserProgresses)
                .HasForeignKey(p => p.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasOne(p => p.Story)
                .WithMany(s => s.UserProgresses)
                .HasForeignKey(p => p.StoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Chapter)
                .WithMany(c => c.UserProgresses)
                .HasForeignKey(p => p.ChapterId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
