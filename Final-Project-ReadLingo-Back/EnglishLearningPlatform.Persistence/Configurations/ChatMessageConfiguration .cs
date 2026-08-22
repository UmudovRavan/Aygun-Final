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
    public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.ToTable("ChatMessages");

            builder.Property(m => m.UserMessage).IsRequired();
            builder.Property(m => m.AIResponse).IsRequired();

            builder.HasIndex(m => new { m.ConversationId, m.CreatedAt });

       
            builder.HasOne(m => m.AppUser)
                .WithMany()
                .HasForeignKey(m => m.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
