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
    public class FlashcardHistoryConfiguration : IEntityTypeConfiguration<FlashcardHistory>
    {
        public void Configure(EntityTypeBuilder<FlashcardHistory> builder)
        {
            builder.ToTable("FlashcardHistories");

            builder.HasIndex(h => new { h.AppUserId, h.ShownAt });

            builder.HasOne(h => h.AppUser)
                .WithMany(u => u.FlashcardHistories)
                .HasForeignKey(h => h.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(h => h.Vocabulary)
                .WithMany()
                .HasForeignKey(h => h.VocabularyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
