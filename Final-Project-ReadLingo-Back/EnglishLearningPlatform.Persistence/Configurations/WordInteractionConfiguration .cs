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
    public class WordInteractionConfiguration : IEntityTypeConfiguration<WordInteraction>
    {
        public void Configure(EntityTypeBuilder<WordInteraction> builder)
        {
            builder.ToTable("WordInteractions");

            builder.Property(w => w.InteractionType).HasConversion<string>().HasMaxLength(50);

            builder.HasIndex(w => new { w.AppUserId, w.VocabularyId });
            builder.HasIndex(w => new { w.AppUserId, w.WordTranslationId });

            builder.HasOne(w => w.AppUser)
                .WithMany(u => u.WordInteractions)
                .HasForeignKey(w => w.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            
            builder.HasOne(w => w.Vocabulary)
                .WithMany()
                .HasForeignKey(w => w.VocabularyId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.WordTranslation)
                .WithMany(t => t.WordInteractions)
                .HasForeignKey(w => w.WordTranslationId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(w => w.Chapter)
                .WithMany()
                .HasForeignKey(w => w.ChapterId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
