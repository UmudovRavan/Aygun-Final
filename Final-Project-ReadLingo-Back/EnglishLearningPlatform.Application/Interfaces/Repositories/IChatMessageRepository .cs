using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IChatMessageRepository : IGenericRepository<ChatMessage>
    {
        Task<IReadOnlyList<ChatMessage>> GetRecentByConversationIdAsync(
            Guid conversationId, int limit, CancellationToken cancellationToken = default);

        Task<int> CountTodayByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default);
    }
}
