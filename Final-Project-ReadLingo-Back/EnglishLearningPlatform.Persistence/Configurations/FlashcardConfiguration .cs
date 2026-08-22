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
    public class FlashcardConfiguration : IEntityTypeConfiguration<Flashcard>
    {
        public void Configure(EntityTypeBuilder<Flashcard> builder)
        {
            builder.ToTable("Flashcards");

            builder.Property(f => f.Status).HasConversion<string>().HasMaxLength(50);


            builder.HasIndex(f => new { f.AppUserId, f.VocabularyId })
                .IsUnique()
                .HasFilter("[VocabularyId] IS NOT NULL");

            builder.HasIndex(f => new { f.AppUserId, f.WordTranslationId })
                .IsUnique()
                .HasFilter("[WordTranslationId] IS NOT NULL");

            builder.HasIndex(f => f.NextReviewDate);

            builder.HasOne(f => f.AppUser)
                .WithMany(u => u.Flashcards)
                .HasForeignKey(f => f.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Vocabulary)
                .WithMany(v => v.Flashcards)
                .HasForeignKey(f => f.VocabularyId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(f => f.WordTranslation)
                .WithMany()
                .HasForeignKey(f => f.WordTranslationId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
