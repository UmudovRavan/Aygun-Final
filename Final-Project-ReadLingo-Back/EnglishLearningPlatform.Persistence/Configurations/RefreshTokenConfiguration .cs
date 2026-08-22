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
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens");

            builder.Property(r => r.Token).HasMaxLength(500).IsRequired();
            builder.Property(r => r.ReplacedByToken).HasMaxLength(500);
            builder.Property(r => r.CreatedByIp).HasMaxLength(50);
            builder.Property(r => r.RevokedByIp).HasMaxLength(50);

            builder.HasIndex(r => r.Token).IsUnique();

            builder.HasOne(r => r.AppUser)
                .WithMany()
                .HasForeignKey(r => r.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
