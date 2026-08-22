using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.DTOs.Chapter;
using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.DTOs.Story;
using EnglishLearningPlatform.Application.DTOs.Vocabulary;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class AIStoryGeneratorService : IAIStoryGeneratorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderClient _aiProviderClient;
        private readonly ISubscriptionAccessService _subscriptionAccessService;
        private readonly IMapper _mapper;

        public AIStoryGeneratorService(
            IUnitOfWork unitOfWork,
            IAIProviderClient aiProviderClient,
            ISubscriptionAccessService subscriptionAccessService,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _aiProviderClient = aiProviderClient;
            _subscriptionAccessService = subscriptionAccessService;
            _mapper = mapper;
        }

        public async Task<Result<GeneratedStoryDto>> GenerateAsync(
            Guid userId, GenerateStoryRequestDto dto, CancellationToken cancellationToken = default)
        {
            await _subscriptionAccessService.EnsureTierAsync(userId, SubscriptionTier.Premium, cancellationToken);

            var defaultCategory = await _unitOfWork.StoryCategories.GetPagedAsync(
                1, 1, c => c.Name == dto.Topic, null, cancellationToken);
            var category = defaultCategory.Items.FirstOrDefault();
            if (category is null)
            {
                category = new StoryCategory { Name = dto.Topic, Description = $"AI-generated stories about {dto.Topic}" };
                await _unitOfWork.StoryCategories.AddAsync(category, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            var level = await _unitOfWork.StoryLevels.GetPagedAsync(
                1, 1, l => l.Name == dto.Level, null, cancellationToken);
            var storyLevel = level.Items.FirstOrDefault();
            if (storyLevel is null)
                return Result<GeneratedStoryDto>.Failure($"Story level \"{dto.Level}\" was not found. Please seed CEFR levels first.");

            var aiPrompt = BuildStoryGenerationPrompt(dto);

            AiStoryPayload? parsed;
            try
            {
                var aiResponse = await _aiProviderClient.CompleteAsync(AIFeatureType.StoryGeneration, aiPrompt, cancellationToken);
                var cleanedJson = EnglishLearningPlatform.Application.Common.JsonCleaner.Clean(aiResponse);
                parsed = System.Text.Json.JsonSerializer.Deserialize<AiStoryPayload>(
                    cleanedJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception)
            {
                return Result<GeneratedStoryDto>.Failure("The AI story generator is currently unavailable. Please try again shortly.");
            }

            if (parsed is null || string.IsNullOrWhiteSpace(parsed.Title) || parsed.Chapters.Count == 0)
                return Result<GeneratedStoryDto>.Failure("The AI provider returned an invalid story format.");

            var story = new Story
            {
                Title = parsed.Title,
                Description = parsed.Description,
                Language = "en",
                IsPublished = false,
                EstimatedMinutes = Math.Max(1, dto.WordCount / 200),
                StoryCategoryId = category.Id,
                StoryLevelId = storyLevel.Id,
            };
            await _unitOfWork.Stories.AddAsync(story, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var chapters = new List<Chapter>();
            var order = 1;
            foreach (var aiChapter in parsed.Chapters)
            {
                var chapter = new Chapter
                {
                    StoryId = story.Id,
                    Title = aiChapter.Title,
                    Content = aiChapter.Content,
                    Order = order++,
                };
                chapters.Add(chapter);
                await _unitOfWork.Chapters.AddAsync(chapter, cancellationToken);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var vocabularyEntities = new List<Vocabulary>();
            foreach (var aiWord in parsed.Vocabulary)
            {
                var targetChapter = chapters.FirstOrDefault() ?? chapters[0];
                var vocabulary = new Vocabulary { ChapterId = targetChapter.Id, Word = aiWord.Word };
                await _unitOfWork.Vocabularies.AddAsync(vocabulary, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                await _unitOfWork.WordDefinitions.AddAsync(new WordDefinition
                {
                    VocabularyId = vocabulary.Id,
                    Definition = aiWord.Definition,
                    Language = "en",
                }, cancellationToken);

                vocabularyEntities.Add(vocabulary);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            Quiz? quiz = null;
            if (dto.QuizQuestionCount > 0 && parsed.QuizQuestions.Count > 0 && chapters.Count > 0)
            {
                quiz = new Quiz
                {
                    ChapterId = chapters[0].Id,
                    Title = $"{parsed.Title} - Quiz",
                    PassingScore = 70,
                };
                await _unitOfWork.Quizzes.AddAsync(quiz, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var questionOrder = 1;
                foreach (var aiQuestion in parsed.QuizQuestions.Take(dto.QuizQuestionCount))
                {
                    var question = new Question
                    {
                        QuizId = quiz.Id,
                        Text = aiQuestion.Question,
                        QuestionType = Domain.Enums.QuestionType.MultipleChoice,
                        Order = questionOrder++,
                    };
                    await _unitOfWork.Questions.AddAsync(question, cancellationToken);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);

                    var answerOrder = 0;
                    foreach (var option in aiQuestion.Options)
                    {
                        await _unitOfWork.Answers.AddAsync(new Answer
                        {
                            QuestionId = question.Id,
                            Text = option,
                            IsCorrect = answerOrder == aiQuestion.CorrectIndex,
                            Order = answerOrder++,
                        }, cancellationToken);
                    }
                }
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            var storyWithDetails = await _unitOfWork.Stories.GetWithDetailsAsync(story.Id, cancellationToken);
            var quizWithDetails = quiz != null
                ? await _unitOfWork.Quizzes.GetWithQuestionsAndAnswersAsync(quiz.Id, cancellationToken)
                : null;

            var response = new GeneratedStoryDto
            {
                Story = _mapper.Map<StoryDto>(storyWithDetails),
                Chapters = _mapper.Map<List<ChapterDto>>(chapters),
                Vocabulary = _mapper.Map<List<VocabularyDto>>(vocabularyEntities),
                Quiz = quizWithDetails != null ? _mapper.Map<QuizDto>(quizWithDetails) : null,
            };

            return Result<GeneratedStoryDto>.Success(response, "Story generated successfully.");
        }

        private static string BuildStoryGenerationPrompt(GenerateStoryRequestDto dto)
        {
            return $$"""
            Generate an English learning story for CEFR level {{dto.Level}} about the topic "{{dto.Topic}}",
            approximately {{dto.WordCount}} words. Additional instructions: {{dto.Prompt}}
            Also generate {{dto.QuizQuestionCount}} multiple-choice comprehension/vocabulary questions.

            Respond ONLY as JSON matching exactly this schema, no extra text:
            {
              "title": "string",
              "description": "string",
              "chapters": [ { "title": "string", "content": "string" } ],
              "vocabulary": [ { "word": "string", "definition": "string" } ],
              "quizQuestions": [
                { "question": "string", "options": ["string","string","string","string"], "correctIndex": 0 }
              ]
            }
            """;
        }

        private record AiChapterPayload(string Title, string Content);
        private record AiVocabularyPayload(string Word, string Definition);
        private record AiQuizQuestionPayload(string Question, List<string> Options, int CorrectIndex);
        private record AiStoryPayload(
            string Title,
            string? Description,
            List<AiChapterPayload> Chapters,
            List<AiVocabularyPayload> Vocabulary,
            List<AiQuizQuestionPayload> QuizQuestions);
    }
}