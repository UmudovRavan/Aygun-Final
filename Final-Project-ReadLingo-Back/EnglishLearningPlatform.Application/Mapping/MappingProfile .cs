using AutoMapper;
using EnglishLearningPlatform.Application.DTOs;
using EnglishLearningPlatform.Application.DTOs.Admin;
using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.DTOs.Bookmark;
using EnglishLearningPlatform.Application.DTOs.Chapter;
using EnglishLearningPlatform.Application.DTOs.Favorite;
using EnglishLearningPlatform.Application.DTOs.Notification;
using EnglishLearningPlatform.Application.DTOs.Profile;
using EnglishLearningPlatform.Application.DTOs.Progress;
using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.DTOs.Story;
using EnglishLearningPlatform.Application.DTOs.StoryCategory;
using EnglishLearningPlatform.Application.DTOs.StoryLevel;
using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.DTOs.Support;
using EnglishLearningPlatform.Application.DTOs.Vocabulary;
using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Mapping
{
  
public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Story, StoryDto>()
                .ForMember(d => d.StoryCategoryName, o => o.MapFrom(s => s.StoryCategory.Name))
                .ForMember(d => d.StoryLevelName, o => o.MapFrom(s => s.StoryLevel.Name))
                .ForMember(d => d.ChapterCount, o => o.MapFrom(s => s.Chapters.Count))
                .ForMember(d => d.AverageRating, o => o.MapFrom(s =>
                    s.Reviews.Count == 0 ? 0 : s.Reviews.Average(r => r.Rating)));
            CreateMap<Story, StoryDetailDto>()
                .ForMember(d => d.StoryCategoryName, o => o.MapFrom(s => s.StoryCategory.Name))
                .ForMember(d => d.StoryLevelName, o => o.MapFrom(s => s.StoryLevel.Name))
                .ForMember(d => d.ChapterCount, o => o.MapFrom(s => s.Chapters.Count))
                .ForMember(d => d.AverageRating, o => o.MapFrom(s =>
                    s.Reviews.Count == 0 ? 0 : s.Reviews.Average(r => r.Rating)))
                .ForMember(d => d.Chapters, o => o.MapFrom(s => s.Chapters.OrderBy(c => c.Order)));
            CreateMap<CreateStoryDto, Story>();
            CreateMap<UpdateStoryDto, Story>();

            CreateMap<StoryCategory, StoryCategoryDto>()
                .ForMember(d => d.StoryCount, o => o.MapFrom(c => c.Stories.Count));
            CreateMap<CreateStoryCategoryDto, StoryCategory>();
            CreateMap<UpdateStoryCategoryDto, StoryCategory>();

            CreateMap<StoryLevel, StoryLevelDto>();
            CreateMap<CreateStoryLevelDto, StoryLevel>();
            CreateMap<UpdateStoryLevelDto, StoryLevel>();

            CreateMap<Chapter, ChapterDto>()
                .ForMember(d => d.VocabularyCount, o => o.MapFrom(c => c.Vocabularies.Count))
                .ForMember(d => d.QuizCount, o => o.MapFrom(c => c.Quizzes.Count));
            CreateMap<Chapter, ChapterSummaryDto>();
            CreateMap<CreateChapterDto, Chapter>();
            CreateMap<UpdateChapterDto, Chapter>();

            CreateMap<Vocabulary, VocabularyDto>()
                .ForMember(d => d.Definitions, o => o.MapFrom(v => v.WordDefinitions));
            CreateMap<WordDefinition, WordDefinitionDto>();
            CreateMap<CreateWordDefinitionDto, WordDefinition>();
            CreateMap<CreateVocabularyDto, Vocabulary>()
                .ForMember(d => d.WordDefinitions, o => o.MapFrom(s => s.Definitions));
            CreateMap<UpdateVocabularyDto, Vocabulary>();

            CreateMap<Quiz, QuizDto>();
            CreateMap<Question, QuestionDto>();
            CreateMap<Answer, AnswerDto>();
            CreateMap<CreateQuizDto, Quiz>();
            CreateMap<CreateQuestionDto, Question>();
            CreateMap<CreateAnswerDto, Answer>();
            CreateMap<UpdateQuizDto, Quiz>();

            CreateMap<Bookmark, BookmarkDto>()
                .ForMember(d => d.ChapterTitle, o => o.MapFrom(b => b.Chapter.Title));
            CreateMap<CreateBookmarkDto, Bookmark>();
            CreateMap<UpdateBookmarkDto, Bookmark>();

            CreateMap<FavoriteStory, FavoriteStoryDto>()
                .ForMember(d => d.StoryTitle, o => o.MapFrom(f => f.Story.Title))
                .ForMember(d => d.StoryCoverImageUrl, o => o.MapFrom(f => f.Story.CoverImageUrl));

            CreateMap<SupportTicket, SupportTicketDto>()
                .ForMember(d => d.UserEmail, o => o.MapFrom(t => t.AppUser.Email));
            CreateMap<CreateSupportTicketDto, SupportTicket>();
            CreateMap<UpdateSupportTicketDto, SupportTicket>();

            CreateMap<Notification, NotificationDto>();
            CreateMap<CreateNotificationDto, Notification>();

            CreateMap<AppUser, ProfileDto>();
            CreateMap<UpdateProfileDto, AppUser>();

            CreateMap<AppUser, AdminUserDto>()
                .ForMember(d => d.Roles, o => o.Ignore()); 

            CreateMap<UserProgress, UserProgressDto>()
                .ForMember(d => d.StoryTitle, o => o.MapFrom(p => p.Story.Title));
            CreateMap<ReadingHistory, ReadingHistoryDto>()
                .ForMember(d => d.StoryTitle, o => o.MapFrom(h => h.Story.Title))
                .ForMember(d => d.ChapterTitle, o => o.MapFrom(h => h.Chapter.Title));

            CreateMap<Subscription, SubscriptionDto>();

            CreateMap<AIHistory, AIHistoryDto>();
        }
    }
}
