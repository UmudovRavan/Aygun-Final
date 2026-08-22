using EnglishLearningPlatform.Application.DTOs.Chat;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IChatService
    {
        Task<Result<ChatResponseDto>> SendMessageAsync(Guid? userId, ChatRequestDto dto, CancellationToken cancellationToken = default);

        Task<Result<IReadOnlyList<ChatConversationDto>>> GetConversationsAsync(Guid userId, CancellationToken cancellationToken = default);

        Task<Result<IReadOnlyList<ChatMessageDto>>> GetMessagesAsync(
            Guid userId, Guid conversationId, int limit = 20, CancellationToken cancellationToken = default);

        Task<Result<ChatUsageDto>> GetUsageAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
