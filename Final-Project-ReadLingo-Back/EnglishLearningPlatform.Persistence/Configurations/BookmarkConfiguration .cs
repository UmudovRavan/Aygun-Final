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

    public class BookmarkConfiguration : IEntityTypeConfiguration<Bookmark>
    {
        public void Configure(EntityTypeBuilder<Bookmark> builder)
        {
            builder.ToTable("Bookmarks");

            builder.Property(b => b.Note).HasMaxLength(1000);

            builder.HasIndex(b => new { b.AppUserId, b.ChapterId });

            builder.HasOne(b => b.AppUser)
                .WithMany(u => u.Bookmarks)
                .HasForeignKey(b => b.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Chapter)
                .WithMany(c => c.Bookmarks)
                .HasForeignKey(b => b.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
