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
    public class FlashcardProgressConfiguration : IEntityTypeConfiguration<FlashcardProgress>
    {
        public void Configure(EntityTypeBuilder<FlashcardProgress> builder)
        {
            builder.ToTable("FlashcardProgresses");

            builder.HasIndex(p => p.AppUserId).IsUnique();

            builder.HasOne(p => p.AppUser)
                .WithMany()
                .HasForeignKey(p => p.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.LastShownVocabulary)
                .WithMany()
                .HasForeignKey(p => p.LastShownVocabularyId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
