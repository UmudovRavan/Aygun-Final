using EnglishLearningPlatform.Application.DTOs.AI;
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
    public class StandaloneQuizGeneratorService : IStandaloneQuizGeneratorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderClient _aiProviderClient;
        private readonly ISubscriptionAccessService _subscriptionAccessService;

        public StandaloneQuizGeneratorService(
            IUnitOfWork unitOfWork,
            IAIProviderClient aiProviderClient,
            ISubscriptionAccessService subscriptionAccessService)
        {
            _unitOfWork = unitOfWork;
            _aiProviderClient = aiProviderClient;
            _subscriptionAccessService = subscriptionAccessService;
        }

        public async Task<Result<GeneratedStandaloneQuizDto>> GenerateAsync(
            Guid userId, GenerateStandaloneQuizRequestDto dto, CancellationToken cancellationToken = default)
        {
            await _subscriptionAccessService.EnsureTierAsync(userId, SubscriptionTier.Premium, cancellationToken);

            var prompt = $$"""
            Generate exactly {{dto.QuestionCount}} multiple-choice English vocabulary/comprehension
            questions for CEFR level {{dto.Level}} about the topic "{{dto.Topic}}" (target reading
            difficulty roughly equivalent to a {{dto.WordCount}}-word passage on this topic).

            Respond ONLY as JSON array, no extra text:
            [{ "question":"...", "options":["...","...","...","..."], "correctIndex":0 }]
            """;

            string aiResponse;
            try
            {
                aiResponse = await _aiProviderClient.CompleteAsync(AIFeatureType.QuizGeneration, prompt, cancellationToken);
            }
            catch (Exception)
            {
                return Result<GeneratedStandaloneQuizDto>.Failure("The AI quiz generator is currently unavailable. Please try again shortly.");
            }

            List<AiQuestionPayload>? parsed;
            try
            {
                var cleanedJson = EnglishLearningPlatform.Application.Common.JsonCleaner.Clean(aiResponse);
                parsed = System.Text.Json.JsonSerializer.Deserialize<List<AiQuestionPayload>>(
                    cleanedJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception)
            {
                return Result<GeneratedStandaloneQuizDto>.Failure("The AI provider returned an invalid quiz format.");
            }

            if (parsed is null || parsed.Count == 0)
                return Result<GeneratedStandaloneQuizDto>.Failure("The AI provider returned an invalid quiz format.");

            await _unitOfWork.AIQuizGenerationHistories.AddAsync(new AIQuizGenerationHistory
            {
                AppUserId = userId,
                Topic = dto.Topic,
                Level = dto.Level,
                WordCount = dto.WordCount,
                QuestionCount = dto.QuestionCount,
                RawResponse = aiResponse,
            }, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var result = new GeneratedStandaloneQuizDto
            {
                Topic = dto.Topic,
                Level = dto.Level,
                Questions = parsed.Select(p => new GeneratedStandaloneQuestionDto
                {
                    Text = p.Question,
                    Options = p.Options,
                    CorrectOptionIndex = p.CorrectIndex,
                }).ToList(),
            };

            return Result<GeneratedStandaloneQuizDto>.Success(result, "Quiz generated successfully.");
        }

        private record AiQuestionPayload(string Question, List<string> Options, int CorrectIndex);
    }
}