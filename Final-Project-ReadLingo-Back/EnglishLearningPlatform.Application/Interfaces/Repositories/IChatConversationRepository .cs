using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IChatConversationRepository : IGenericRepository<ChatConversation>
    {
        Task<IReadOnlyList<ChatConversation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

        Task<ChatConversation?> GetWithRecentMessagesAsync(
            Guid conversationId, int messageLimit, CancellationToken cancellationToken = default);
    }
}
