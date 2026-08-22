using System;

namespace EnglishLearningPlatform.Application.DTOs.Leaderboard
{
    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }

        public Guid UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string? ProfilePictureUrl { get; set; }

        public string Level { get; set; } = "A1";

        public int TotalXp { get; set; }

        public int StoriesReadCount { get; set; }

        public int WordsLearnedCount { get; set; }

        public int QuizzesCompletedCount { get; set; }

        public double AccuracyPercentage { get; set; }

        public bool IsCurrentUser { get; set; }

        public bool IsAnonymous { get; set; }
    }
}
