namespace EnglishLearningPlatform.Application.Interfaces.Repositories;

public interface IUnitOfWork : IDisposable
{
    IAppUserRepository Users { get; }
    IStoryRepository Stories { get; }
    IStoryCategoryRepository StoryCategories { get; }
    IStoryLevelRepository StoryLevels { get; }
    IChapterRepository Chapters { get; }
    IVocabularyRepository Vocabularies { get; }
    IWordDefinitionRepository WordDefinitions { get; }
    IQuizRepository Quizzes { get; }
    IQuestionRepository Questions { get; }
    IAnswerRepository Answers { get; }
    IUserProgressRepository UserProgresses { get; }
    IReadingHistoryRepository ReadingHistories { get; }
    IFavoriteStoryRepository FavoriteStories { get; }
    IBookmarkRepository Bookmarks { get; }
    IFlashcardRepository Flashcards { get; }
    INotificationRepository Notifications { get; }
    ISupportTicketRepository SupportTickets { get; }
    ISubscriptionRepository Subscriptions { get; }
    IPaymentRepository Payments { get; }
    IAIHistoryRepository AIHistories { get; }
    IReviewRepository Reviews { get; }
    IWordInteractionRepository WordInteractions { get; }
    IQuizAttemptRepository QuizAttempts { get; }
    IWordTranslationRepository WordTranslations { get; }
    IChatConversationRepository ChatConversations { get; }
    IChatMessageRepository ChatMessages { get; }
    IHeartRecoveryTimerRepository HeartRecoveryTimers { get; }
    IRemainingCorrectCounterRepository RemainingCorrectCounters { get; }
    IFlashcardProgressRepository FlashcardProgresses { get; }
    IFlashcardHistoryRepository FlashcardHistories { get; }
    IAIQuizGenerationHistoryRepository AIQuizGenerationHistories { get; }
    IDailyStoryReadLogRepository DailyStoryReadLogs { get; }

    IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}