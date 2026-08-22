using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Repositories
{
    public class ChatConversationRepository : GenericRepository<ChatConversation>, IChatConversationRepository
    {
        public ChatConversationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<ChatConversation>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet
                .Where(c => c.AppUserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(cancellationToken);

        public async Task<ChatConversation?> GetWithRecentMessagesAsync(
            Guid conversationId, int messageLimit, CancellationToken cancellationToken = default)
        {
            var conversation = await DbSet.FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken);
            if (conversation is null)
                return null;

            conversation.Messages = await Context.Set<ChatMessage>()
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(messageLimit)
                .OrderBy(m => m.CreatedAt) 
                .ToListAsync(cancellationToken);

            return conversation;
        }
    }
}
