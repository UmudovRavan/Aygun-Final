using EnglishLearningPlatform.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EnglishLearningPlatform.Persistence.Context;

public class ApplicationDbContext : IdentityDbContext<AppUser, AppRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Story> Stories => Set<Story>();
    public DbSet<StoryCategory> StoryCategories => Set<StoryCategory>();
    public DbSet<StoryLevel> StoryLevels => Set<StoryLevel>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<Vocabulary> Vocabularies => Set<Vocabulary>();
    public DbSet<WordDefinition> WordDefinitions => Set<WordDefinition>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();
    public DbSet<ReadingHistory> ReadingHistories => Set<ReadingHistory>();
    public DbSet<FavoriteStory> FavoriteStories => Set<FavoriteStory>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AIHistory> AIHistories => Set<AIHistory>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<WordInteraction> WordInteractions => Set<WordInteraction>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<WordTranslation> WordTranslations => Set<WordTranslation>();
    public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<HeartRecoveryTimer> HeartRecoveryTimers => Set<HeartRecoveryTimer>();
    public DbSet<RemainingCorrectCounter> RemainingCorrectCounters => Set<RemainingCorrectCounter>();
    public DbSet<FlashcardProgress> FlashcardProgresses => Set<FlashcardProgress>();
    public DbSet<FlashcardHistory> FlashcardHistories => Set<FlashcardHistory>();
    public DbSet<AIQuizGenerationHistory> AIQuizGenerationHistories => Set<AIQuizGenerationHistory>();
    public DbSet<DailyStoryReadLog> DailyStoryReadLogs => Set<DailyStoryReadLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}