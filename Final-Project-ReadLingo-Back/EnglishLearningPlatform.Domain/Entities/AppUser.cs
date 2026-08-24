using EnglishLearningPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Domain.Entities
{
    public class AppUser : IdentityUser<Guid>
    {        
        public int Hearts { get; set; } = 5;
        public DateTime? LastHeartLostAt { get; set; }
        public int TotalXp { get; set; }
        public int ConsecutiveCorrectAnswers { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? NativeLanguage { get; set; }
        public string? LearningLanguage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastLoginAt { get; set; }
        public SubscriptionTier CurrentTier { get; set; } = SubscriptionTier.Free;
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastStreakDate { get; set; }
        public string LearningLevel { get; set; } = "A1";
        public int DailyGoalMinutes { get; set; } = 15;
        public bool IsAnonymousInLeaderboard { get; set; } = false;

        public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
        public ICollection<ReadingHistory> ReadingHistories { get; set; } = new List<ReadingHistory>();
        public ICollection<FavoriteStory> FavoriteStories { get; set; } = new List<FavoriteStory>();
        public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
        public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<AIHistory> AIHistories { get; set; } = new List<AIHistory>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<WordInteraction> WordInteractions { get; set; } = new List<WordInteraction>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
        public ICollection<ChatConversation> ChatConversations { get; set; } = new List<ChatConversation>();
        public ICollection<HeartRecoveryTimer> HeartRecoveryTimers { get; set; } = new List<HeartRecoveryTimer>();
        public ICollection<RemainingCorrectCounter> RemainingCorrectCounters { get; set; } = new List<RemainingCorrectCounter>();
        public ICollection<FlashcardHistory> FlashcardHistories { get; set; } = new List<FlashcardHistory>();
        public ICollection<AIQuizGenerationHistory> AIQuizGenerationHistories { get; set; } = new List<AIQuizGenerationHistory>();
        public ICollection<DailyStoryReadLog> DailyStoryReadLogs { get; set; } = new List<DailyStoryReadLog>();
    }
}
