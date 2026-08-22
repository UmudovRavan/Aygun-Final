using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Persistence.Context;
using EnglishLearningPlatform.Persistence.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace EnglishLearningPlatform.Persistence.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _currentTransaction;

    private IAppUserRepository? _users;
    private IStoryRepository? _stories;
    private IStoryCategoryRepository? _storyCategories;
    private IStoryLevelRepository? _storyLevels;
    private IChapterRepository? _chapters;
    private IVocabularyRepository? _vocabularies;
    private IWordDefinitionRepository? _wordDefinitions;
    private IQuizRepository? _quizzes;
    private IQuestionRepository? _questions;
    private IAnswerRepository? _answers;
    private IUserProgressRepository? _userProgresses;
    private IReadingHistoryRepository? _readingHistories;
    private IFavoriteStoryRepository? _favoriteStories;
    private IBookmarkRepository? _bookmarks;
    private IFlashcardRepository? _flashcards;
    private INotificationRepository? _notifications;
    private ISupportTicketRepository? _supportTickets;
    private ISubscriptionRepository? _subscriptions;
    private IPaymentRepository? _payments;
    private IAIHistoryRepository? _aiHistories;
    private IReviewRepository? _reviews;
    private IWordInteractionRepository? _wordInteractions;
    private IQuizAttemptRepository? _quizAttempts;
    private IWordTranslationRepository? _wordTranslations;
    private IChatConversationRepository? _chatConversations;
    private IChatMessageRepository? _chatMessages;
    private IHeartRecoveryTimerRepository? _heartRecoveryTimers;
    private IRemainingCorrectCounterRepository? _remainingCorrectCounters;
    private IFlashcardProgressRepository? _flashcardProgresses;
    private IFlashcardHistoryRepository? _flashcardHistories;
    private IAIQuizGenerationHistoryRepository? _aiQuizGenerationHistories;
    private IDailyStoryReadLogRepository? _dailyStoryReadLogs;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IAppUserRepository Users => _users ??= new AppUserRepository(_context);
    public IStoryRepository Stories => _stories ??= new StoryRepository(_context);
    public IStoryCategoryRepository StoryCategories => _storyCategories ??= new StoryCategoryRepository(_context);
    public IStoryLevelRepository StoryLevels => _storyLevels ??= new StoryLevelRepository(_context);
    public IChapterRepository Chapters => _chapters ??= new ChapterRepository(_context);
    public IVocabularyRepository Vocabularies => _vocabularies ??= new VocabularyRepository(_context);
    public IWordDefinitionRepository WordDefinitions => _wordDefinitions ??= new WordDefinitionRepository(_context);
    public IQuizRepository Quizzes => _quizzes ??= new QuizRepository(_context);
    public IQuestionRepository Questions => _questions ??= new QuestionRepository(_context);
    public IAnswerRepository Answers => _answers ??= new AnswerRepository(_context);
    public IUserProgressRepository UserProgresses => _userProgresses ??= new UserProgressRepository(_context);
    public IReadingHistoryRepository ReadingHistories => _readingHistories ??= new ReadingHistoryRepository(_context);
    public IFavoriteStoryRepository FavoriteStories => _favoriteStories ??= new FavoriteStoryRepository(_context);
    public IBookmarkRepository Bookmarks => _bookmarks ??= new BookmarkRepository(_context);
    public IFlashcardRepository Flashcards => _flashcards ??= new FlashcardRepository(_context);
    public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);
    public ISupportTicketRepository SupportTickets => _supportTickets ??= new SupportTicketRepository(_context);
    public ISubscriptionRepository Subscriptions => _subscriptions ??= new SubscriptionRepository(_context);
    public IPaymentRepository Payments => _payments ??= new PaymentRepository(_context);
    public IAIHistoryRepository AIHistories => _aiHistories ??= new AIHistoryRepository(_context);
    public IReviewRepository Reviews => _reviews ??= new ReviewRepository(_context);
    public IWordInteractionRepository WordInteractions => _wordInteractions ??= new WordInteractionRepository(_context);
    public IQuizAttemptRepository QuizAttempts => _quizAttempts ??= new QuizAttemptRepository(_context);
    public IWordTranslationRepository WordTranslations => _wordTranslations ??= new WordTranslationRepository(_context);
    public IChatConversationRepository ChatConversations => _chatConversations ??= new ChatConversationRepository(_context);
    public IChatMessageRepository ChatMessages => _chatMessages ??= new ChatMessageRepository(_context);
    public IHeartRecoveryTimerRepository HeartRecoveryTimers => _heartRecoveryTimers ??= new HeartRecoveryTimerRepository(_context);
    public IRemainingCorrectCounterRepository RemainingCorrectCounters => _remainingCorrectCounters ??= new RemainingCorrectCounterRepository(_context);
    public IFlashcardProgressRepository FlashcardProgresses => _flashcardProgresses ??= new FlashcardProgressRepository(_context);
    public IFlashcardHistoryRepository FlashcardHistories => _flashcardHistories ??= new FlashcardHistoryRepository(_context);
    public IAIQuizGenerationHistoryRepository AIQuizGenerationHistories => _aiQuizGenerationHistories ??= new AIQuizGenerationHistoryRepository(_context);
    public IDailyStoryReadLogRepository DailyStoryReadLogs => _dailyStoryReadLogs ??= new DailyStoryReadLogRepository(_context);

    public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class =>
        new GenericRepository<TEntity>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            if (_currentTransaction != null)
                await _currentTransaction.CommitAsync(cancellationToken);
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction != null)
                await _currentTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public void Dispose()
    {
        _currentTransaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}