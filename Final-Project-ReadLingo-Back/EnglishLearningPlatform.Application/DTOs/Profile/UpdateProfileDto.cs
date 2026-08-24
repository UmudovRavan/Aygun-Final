using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Profile
{
    public class UpdateProfileDto
    {
        public string? UserName { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? NativeLanguage { get; set; }

        public string? LearningLanguage { get; set; }

        public int? Hearts { get; set; }

        public bool? IsAnonymousInLeaderboard { get; set; }

        public string? Plan { get; set; }

        public int? DailyGoalMinutes { get; set; }

        public string? LearningLevel { get; set; }
    }
}
