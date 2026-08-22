using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application
{

    public static class ServiceRegistration
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<IStoryCategoryService, StoryCategoryService>();
            services.AddScoped<IStoryLevelService, StoryLevelService>();
            services.AddScoped<IStoryService, StoryService>();
            services.AddScoped<IChapterService, ChapterService>();
            services.AddScoped<IQuizService, QuizService>();
            services.AddScoped<IVocabularyService, VocabularyService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<IBookmarkService, BookmarkService>();
            services.AddScoped<IFavoriteService, FavoriteService>();
            services.AddScoped<IProgressService, ProgressService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<ISupportService, SupportService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITranslationService, TranslationService>();
            services.AddScoped<IChatService, ChatService>();
            services.AddScoped<ISubscriptionAccessService, SubscriptionAccessService>();
            services.AddScoped<IAIStoryGeneratorService, AIStoryGeneratorService>();
            services.AddScoped<IAIQuizGeneratorService, AIQuizGeneratorService>();
            services.AddScoped<IStandaloneQuizGeneratorService, StandaloneQuizGeneratorService>();
            services.AddScoped<ISubscriptionPaymentService, SubscriptionPaymentService>();
            services.AddScoped<ILeaderboardService, LeaderboardService>();

            return services;
        }
    }

}
