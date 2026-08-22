using EnglishLearningPlatform.Application.Common;
using EnglishLearningPlatform.Application.DTOs.Translation;
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
    public class TranslationService : ITranslationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderClient _aiProviderClient;

        public TranslationService(IUnitOfWork unitOfWork, IAIProviderClient aiProviderClient)
        {
            _unitOfWork = unitOfWork;
            _aiProviderClient = aiProviderClient;
        }

        public async Task<Result<TranslateWordResponseDto>> TranslateAsync(
            TranslateWordRequestDto dto, CancellationToken cancellationToken = default)
        {
            var rawWord = dto.Word?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(rawWord))
                return Result<TranslateWordResponseDto>.Failure("The provided word is empty or invalid.");

            var hasContext = !string.IsNullOrWhiteSpace(dto.ContextSentence);

            string aiPrompt;
            if (hasContext)
            {
                aiPrompt = $@"You are an expert English-Azerbaijani linguistic tutor.
Analyze the target English word '{rawWord}' as it is used specifically in this context sentence:
Context Sentence: ""{dto.ContextSentence}""

Provide:
1. translation: Accurate Azerbaijani translation of '{rawWord}' for this exact sentence context.
2. partOfSpeech: Accurate part of speech (Noun, Verb, Adjective, Adverb, Pronoun, Preposition, Conjunction, etc.).
3. lemma: Base dictionary form of '{rawWord}'.
4. definitionEn: Clear, concise 1-sentence English definition of '{rawWord}' in this context.
5. definitionAz: Clear, natural 1-sentence Azerbaijani explanation of what '{rawWord}' means in this context.
6. pronunciation: Standard IPA phonetic spelling (e.g. /ˈiːvnɪŋ/).

Respond ONLY as valid JSON:
{{
  ""translation"": ""..."",
  ""partOfSpeech"": ""..."",
  ""lemma"": ""..."",
  ""definitionEn"": ""..."",
  ""definitionAz"": ""..."",
  ""pronunciation"": ""...""
}}";
            }
            else
            {
                aiPrompt = $@"You are an expert English-Azerbaijani linguistic tutor.
Translate the English word '{rawWord}' into Azerbaijani.
Provide:
1. translation: Accurate Azerbaijani translation.
2. partOfSpeech: Accurate part of speech (Noun, Verb, Adjective, Adverb, etc.).
3. lemma: Base form of the word.
4. definitionEn: Clear, concise 1-sentence English definition.
5. definitionAz: Clear 1-sentence Azerbaijani explanation.
6. pronunciation: Standard IPA phonetic spelling.

Respond ONLY as valid JSON:
{{
  ""translation"": ""..."",
  ""partOfSpeech"": ""..."",
  ""lemma"": ""..."",
  ""definitionEn"": ""..."",
  ""definitionAz"": ""..."",
  ""pronunciation"": ""...""
}}";
            }

            try
            {
                var aiResponse = await _aiProviderClient.CompleteAsync(AIFeatureType.Translation, aiPrompt, cancellationToken);
                var cleanedJson = EnglishLearningPlatform.Application.Common.JsonCleaner.Clean(aiResponse);
                var parsed = System.Text.Json.JsonSerializer.Deserialize<AiTranslationResponse>(
                    cleanedJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (parsed is null || string.IsNullOrWhiteSpace(parsed.Translation))
                    return Result<TranslateWordResponseDto>.Failure("Translation service could not translate this word.");

                return Result<TranslateWordResponseDto>.Success(new TranslateWordResponseDto
                {
                    OriginalWord = rawWord,
                    Lemma = !string.IsNullOrWhiteSpace(parsed.Lemma) ? parsed.Lemma : rawWord,
                    Translation = parsed.Translation,
                    PartOfSpeech = parsed.PartOfSpeech,
                    DefinitionEn = parsed.DefinitionEn,
                    DefinitionAz = parsed.DefinitionAz,
                    ContextSentence = dto.ContextSentence,
                    Pronunciation = parsed.Pronunciation,
                    WasCached = false,
                });
            }
            catch (Exception)
            {
                // Fallback basic lemmatizer
                var normalized = TextNormalizer.Normalize(rawWord);
                var fallbackLemma = EnglishLemmatizer.Lemmatize(normalized);
                var cached = await _unitOfWork.WordTranslations.GetByLemmaAsync(fallbackLemma, dto.TargetLanguage, cancellationToken);

                if (cached != null)
                {
                    return Result<TranslateWordResponseDto>.Success(new TranslateWordResponseDto
                    {
                        OriginalWord = rawWord,
                        Lemma = fallbackLemma,
                        Translation = cached.Translation,
                        PartOfSpeech = cached.PartOfSpeech,
                        WasCached = true,
                    });
                }

                return Result<TranslateWordResponseDto>.Failure("Translation service is currently unavailable.");
            }
        }

        private record AiTranslationResponse(
            string Translation,
            string? PartOfSpeech,
            string? Lemma,
            string? DefinitionEn,
            string? DefinitionAz,
            string? Pronunciation);
    }
}
