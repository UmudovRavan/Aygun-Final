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
    public class WordTranslationConfiguration : IEntityTypeConfiguration<WordTranslation>
    {
        public void Configure(EntityTypeBuilder<WordTranslation> builder)
        {
            builder.ToTable("WordTranslations");

            builder.Property(w => w.Lemma).HasMaxLength(200).IsRequired();
            builder.Property(w => w.TargetLanguage).HasMaxLength(10).IsRequired();
            builder.Property(w => w.Translation).HasMaxLength(500).IsRequired();
            builder.Property(w => w.PartOfSpeech).HasMaxLength(50);

            builder.HasIndex(w => new { w.Lemma, w.TargetLanguage }).IsUnique();
        }
    }
}
