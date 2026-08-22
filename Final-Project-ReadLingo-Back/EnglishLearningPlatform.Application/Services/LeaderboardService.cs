using EnglishLearningPlatform.Application.DTOs.Leaderboard;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LeaderboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<IReadOnlyList<LeaderboardEntryDto>>> GetLeaderboardAsync(
            string category, Guid? currentUserId, CancellationToken cancellationToken = default)
        {
            var allUsers = await _unitOfWork.Users.GetAllAsync(cancellationToken);
            var activeUsers = allUsers.Where(u => u.IsActive).ToList();

            var entries = new List<LeaderboardEntryDto>();

            foreach (var user in activeUsers)
            {
                var isCurrentUser = currentUserId.HasValue && user.Id == currentUserId.Value;

                var progresses = await _unitOfWork.UserProgresses.GetByUserIdAsync(user.Id, cancellationToken);
                var storiesRead = progresses.Where(p => p.IsCompleted).Select(p => p.StoryId).Distinct().Count();

                var attempts = await _unitOfWork.QuizAttempts.GetByUserIdAsync(user.Id, cancellationToken);
                var completedAttempts = attempts.Where(a => a.CompletedAt != null).ToList();
                var quizzesCount = completedAttempts.Count;
                var totalCorrect = completedAttempts.Sum(a => a.CorrectAnswers);
                var totalAnswered = completedAttempts.Sum(a => a.CorrectAnswers + a.IncorrectAnswers);
                var accuracy = totalAnswered > 0 ? Math.Round(totalCorrect / (double)totalAnswered * 100, 1) : 0;

                var wordsLearned = (await _unitOfWork.FlashcardHistories.GetByUserIdAsync(user.Id, 100, cancellationToken))
                    .Select(h => h.VocabularyId)
                    .Distinct()
                    .Count();

                var isAnon = user.IsAnonymousInLeaderboard && !isCurrentUser;

                entries.Add(new LeaderboardEntryDto
                {
                    UserId = user.Id,
                    UserName = isAnon ? "Anonymous Reader" : (!string.IsNullOrWhiteSpace(user.UserName) ? user.UserName : $"{user.FirstName} {user.LastName}".Trim()),
                    FirstName = isAnon ? "Anonymous" : user.FirstName,
                    LastName = isAnon ? "Reader" : user.LastName,
                    ProfilePictureUrl = isAnon ? null : user.ProfilePictureUrl,
                    Level = user.LearningLevel ?? "A1",
                    TotalXp = user.TotalXp,
                    StoriesReadCount = storiesRead,
                    WordsLearnedCount = wordsLearned > 0 ? wordsLearned : (user.TotalXp / 10),
                    QuizzesCompletedCount = quizzesCount,
                    AccuracyPercentage = accuracy,
                    IsCurrentUser = isCurrentUser,
                    IsAnonymous = user.IsAnonymousInLeaderboard,
                });
            }

            var cat = (category ?? "xp").ToLowerInvariant();
            List<LeaderboardEntryDto> sorted;

            if (cat == "stories")
                sorted = entries.OrderByDescending(e => e.StoriesReadCount).ThenByDescending(e => e.TotalXp).ToList();
            else if (cat == "words")
                sorted = entries.OrderByDescending(e => e.WordsLearnedCount).ThenByDescending(e => e.TotalXp).ToList();
            else if (cat == "quiz")
                sorted = entries.OrderByDescending(e => e.AccuracyPercentage).ThenByDescending(e => e.QuizzesCompletedCount).ThenByDescending(e => e.TotalXp).ToList();
            else
                sorted = entries.OrderByDescending(e => e.TotalXp).ThenByDescending(e => e.StoriesReadCount).ToList();

            for (int i = 0; i < sorted.Count; i++)
            {
                sorted[i].Rank = i + 1;
            }

            return Result<IReadOnlyList<LeaderboardEntryDto>>.Success(sorted);
        }

        public async Task<Result> TogglePrivacyAsync(Guid userId, bool isAnonymous, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            user.IsAnonymousInLeaderboard = isAnonymous;
            user.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(isAnonymous ? "Leaderboard privacy enabled. You now appear as Anonymous." : "Leaderboard privacy disabled. Your name is visible.");
        }
    }
}
