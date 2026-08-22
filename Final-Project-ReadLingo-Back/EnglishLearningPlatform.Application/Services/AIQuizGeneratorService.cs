using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.DTOs.Quiz;
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
    public class AIQuizGeneratorService : IAIQuizGeneratorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderClient _aiProviderClient;
        private readonly ISubscriptionAccessService _subscriptionAccessService;
        private readonly IMapper _mapper;

        public AIQuizGeneratorService(
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

        public async Task<Result<QuizDto>> GenerateForChapterAsync(
            Guid userId, GenerateQuizForChapterDto dto, CancellationToken cancellationToken = default)
        {
            await _subscriptionAccessService.EnsureTierAsync(userId, SubscriptionTier.Premium, cancellationToken);

            var chapter = await _unitOfWork.Chapters.GetByIdAsync(dto.ChapterId, cancellationToken);
            if (chapter is null)
                return Result<QuizDto>.Failure("Chapter not found.");

            var prompt = $$"""
            Generate {{dto.QuestionCount}} multiple-choice questions (vocabulary and reading
            comprehension) based on this chapter text:

            {{chapter.Content}}

            Respond ONLY as JSON: [ { "question":"...", "options":["...","...","...","..."], "correctIndex":0 } ]
            """;

            List<AiQuizQuestionPayload>? parsed;
            try
            {
                var aiResponse = await _aiProviderClient.CompleteAsync(AIFeatureType.QuizGeneration, prompt, cancellationToken);
                var cleanedJson = EnglishLearningPlatform.Application.Common.JsonCleaner.Clean(aiResponse);
                parsed = System.Text.Json.JsonSerializer.Deserialize<List<AiQuizQuestionPayload>>(
                    cleanedJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception)
            {
                return Result<QuizDto>.Failure("The AI quiz generator is currently unavailable. Please try again shortly.");
            }

            if (parsed is null || parsed.Count == 0)
                return Result<QuizDto>.Failure("The AI provider returned an invalid quiz format.");

            var quiz = new Quiz
            {
                ChapterId = dto.ChapterId,
                Title = $"{chapter.Title} - AI Quiz",
                PassingScore = 70,
            };
            await _unitOfWork.Quizzes.AddAsync(quiz, cancellationToken);

            var order = 1;
            foreach (var aiQuestion in parsed)
            {
                var question = new Question
                {
                    QuizId = quiz.Id,
                    Text = aiQuestion.Question,
                    QuestionType = Domain.Enums.QuestionType.MultipleChoice,
                    Order = order++,
                };
                await _unitOfWork.Questions.AddAsync(question, cancellationToken);

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

            var fullQuiz = await _unitOfWork.Quizzes.GetWithQuestionsAndAnswersAsync(quiz.Id, cancellationToken);
            return Result<QuizDto>.Success(_mapper.Map<QuizDto>(fullQuiz), "Quiz generated successfully.");
        }

        private record AiQuizQuestionPayload(string Question, List<string> Options, int CorrectIndex);
    }
}