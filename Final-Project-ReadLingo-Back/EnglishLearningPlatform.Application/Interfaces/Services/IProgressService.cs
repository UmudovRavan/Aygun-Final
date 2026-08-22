using EnglishLearningPlatform.Application.DTOs.Progress;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{

    public interface IProgressService
    {
        Task<Result<IReadOnlyList<UserProgressDto>>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<UserProgressDto>> UpsertAsync(Guid userId, UpsertUserProgressDto dto, CancellationToken cancellationToken = default);
        Task<Result<IReadOnlyList<ReadingHistoryDto>>> GetReadingHistoryAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<ReadingHistoryDto>> RecordReadingAsync(Guid userId, RecordReadingDto dto, CancellationToken cancellationToken = default);
        Task<Result<StreakStatusDto>> RecordDailyActivityAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
