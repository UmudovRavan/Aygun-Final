using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IAIService
    {
        Task<Result<AIHistoryDto>> AskAsync(Guid userId, AIRequestDto dto, CancellationToken cancellationToken = default);
        Task<Result<IReadOnlyList<AIHistoryDto>>> GetHistoryAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
