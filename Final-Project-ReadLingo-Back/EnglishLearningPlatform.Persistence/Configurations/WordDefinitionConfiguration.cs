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
    public class WordDefinitionConfiguration : IEntityTypeConfiguration<WordDefinition>
    {
        public void Configure(EntityTypeBuilder<WordDefinition> builder)
        {
            builder.ToTable("WordDefinitions");

            builder.Property(d => d.Definition).HasMaxLength(1000).IsRequired();
            builder.Property(d => d.PartOfSpeech).HasMaxLength(50);
            builder.Property(d => d.ExampleSentence).HasMaxLength(500);
            builder.Property(d => d.Language).HasMaxLength(50);

            builder.HasOne(d => d.Vocabulary)
                .WithMany(v => v.WordDefinitions)
                .HasForeignKey(d => d.VocabularyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
