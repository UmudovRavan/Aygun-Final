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

    public class ChatMessageRepository : GenericRepository<ChatMessage>, IChatMessageRepository
    {
        public ChatMessageRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<ChatMessage>> GetRecentByConversationIdAsync(
            Guid conversationId, int limit, CancellationToken cancellationToken = default) =>
            await DbSet
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(limit)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync(cancellationToken);

        public async Task<int> CountTodayByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var todayUtc = DateTime.UtcNow.Date;
            return await DbSet
                .Where(m => m.AppUserId == userId && m.CreatedAt >= todayUtc)
                .CountAsync(cancellationToken);
        }
    }
}
