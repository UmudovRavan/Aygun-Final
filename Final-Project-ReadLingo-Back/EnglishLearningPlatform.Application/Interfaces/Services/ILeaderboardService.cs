using EnglishLearningPlatform.Application.DTOs.Leaderboard;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface ILeaderboardService
    {
        Task<Result<IReadOnlyList<LeaderboardEntryDto>>> GetLeaderboardAsync(string category, Guid? currentUserId, CancellationToken cancellationToken = default);
        Task<Result> TogglePrivacyAsync(Guid userId, bool isAnonymous, CancellationToken cancellationToken = default);
    }
}
