using System;

namespace EnglishLearningPlatform.Application.DTOs.Profile
{
    public class ProfileDto
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? NativeLanguage { get; set; }

        public string? LearningLanguage { get; set; }

        public bool EmailConfirmed { get; set; }

        public DateTime CreatedAt { get; set; }


        public int DaysStreak { get; set; }

        public int LongestStreak { get; set; }

        public int TotalXp { get; set; }

        public int Hearts { get; set; } = 5;

        public int StoriesCompleted { get; set; }

        public double AccuracyPercentage { get; set; }

        public bool IsAnonymousInLeaderboard { get; set; }

        public string Plan { get; set; } = "free";

        public int DailyGoalMinutes { get; set; } = 15;

        public string LearningLevel { get; set; } = "A1";

        public int TodayReadingMinutes { get; set; }

        public int TotalReadingTimeMinutes { get; set; }
    }
}