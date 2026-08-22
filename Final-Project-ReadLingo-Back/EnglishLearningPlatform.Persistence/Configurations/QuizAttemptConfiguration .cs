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
    public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
    {
        public void Configure(EntityTypeBuilder<QuizAttempt> builder)
        {
            builder.ToTable("QuizAttempts");

            builder.HasIndex(a => new { a.AppUserId, a.ChapterId, a.CompletedAt });

            builder.HasOne(a => a.AppUser)
                .WithMany(u => u.QuizAttempts)
                .HasForeignKey(a => a.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Story)
                .WithMany()
                .HasForeignKey(a => a.StoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Chapter)
                .WithMany()
                .HasForeignKey(a => a.ChapterId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Quiz)
                .WithMany()
                .HasForeignKey(a => a.QuizId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
