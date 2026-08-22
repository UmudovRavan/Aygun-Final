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

    public class VocabularyConfiguration : IEntityTypeConfiguration<Vocabulary>
    {
        public void Configure(EntityTypeBuilder<Vocabulary> builder)
        {
            builder.ToTable("Vocabularies");

            builder.Property(v => v.Word).HasMaxLength(200).IsRequired();
            builder.Property(v => v.Pronunciation).HasMaxLength(200);
            builder.Property(v => v.ImageUrl).HasMaxLength(500);
            builder.Property(v => v.AudioUrl).HasMaxLength(500);

            builder.HasIndex(v => v.Word);

            builder.HasOne(v => v.Chapter)
                .WithMany(c => c.Vocabularies)
                .HasForeignKey(v => v.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(v => v.WordDefinitions)
                .WithOne(d => d.Vocabulary)
                .HasForeignKey(d => d.VocabularyId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(v => v.Flashcards)
                .WithOne(f => f.Vocabulary)
                .HasForeignKey(f => f.VocabularyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
