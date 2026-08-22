using AutoMapper;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EnglishLearningPlatform.Application.DTOs.Vocabulary;
using EnglishLearningPlatform.Application.Interfaces.Services;

namespace EnglishLearningPlatform.Application.Services
{
   
    public class VocabularyService : IVocabularyService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public VocabularyService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<VocabularyDto>>> GetAllAsync(
            Guid? userId, Guid? chapterId = null, CancellationToken cancellationToken = default)
        {
            var vocabularies = new List<Domain.Entities.Vocabulary>();

            if (chapterId.HasValue && chapterId.Value != Guid.Empty)
            {
                var chapterVocabs = await _unitOfWork.Vocabularies.GetByChapterIdAsync(chapterId.Value, cancellationToken);
                vocabularies.AddRange(chapterVocabs);
            }
            else
            {
                var allChapters = await _unitOfWork.Chapters.GetAllAsync(cancellationToken);
                foreach (var ch in allChapters)
                {
                    var chVocabs = await _unitOfWork.Vocabularies.GetByChapterIdAsync(ch.Id, cancellationToken);
                    if (chVocabs.Count == 0 && !string.IsNullOrWhiteSpace(ch.Content))
                    {
                        var words = ch.Content.Split(new[] { ' ', '.', ',', '!', '?', ';', ':', '\r', '\n', '"', '\'' }, StringSplitOptions.RemoveEmptyEntries)
                            .Where(w => w.Length >= 4 && char.IsLetter(w[0]))
                            .Select(w => char.ToUpper(w[0]) + w.Substring(1).ToLower())
                            .Distinct()
                            .Take(5)
                            .ToList();

                        foreach (var w in words)
                        {
                            var newVocab = new Domain.Entities.Vocabulary
                            {
                                ChapterId = ch.Id,
                                Word = w,
                                CreatedAt = DateTime.UtcNow
                            };
                            await _unitOfWork.Vocabularies.AddAsync(newVocab, cancellationToken);
                            vocabularies.Add(newVocab);
                        }
                        await _unitOfWork.SaveChangesAsync(cancellationToken);
                    }
                    else
                    {
                        vocabularies.AddRange(chVocabs);
                    }
                }
            }

            var dtos = _mapper.Map<List<VocabularyDto>>(vocabularies.DistinctBy(v => v.Id));
            return Result<IReadOnlyList<VocabularyDto>>.Success(dtos);
        }

        public async Task<Result<IReadOnlyList<VocabularyDto>>> GetByChapterIdAsync(
            Guid chapterId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Vocabularies.GetByChapterIdAsync(chapterId, cancellationToken);
            return Result<IReadOnlyList<VocabularyDto>>.Success(_mapper.Map<IReadOnlyList<VocabularyDto>>(items));
        }

        public async Task<Result<VocabularyDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Vocabularies.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<VocabularyDto>.Failure("Vocabulary word not found.");

            return Result<VocabularyDto>.Success(_mapper.Map<VocabularyDto>(entity));
        }

        public async Task<Result<VocabularyDto>> CreateAsync(
            CreateVocabularyDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Chapters.AnyAsync(c => c.Id == dto.ChapterId, cancellationToken))
                return Result<VocabularyDto>.Failure("Chapter not found.");

            var entity = _mapper.Map<Vocabulary>(dto);
            await _unitOfWork.Vocabularies.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<VocabularyDto>.Success(_mapper.Map<VocabularyDto>(entity), "Vocabulary word created.");
        }

        public async Task<Result<VocabularyDto>> UpdateAsync(
            Guid id, UpdateVocabularyDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Vocabularies.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<VocabularyDto>.Failure("Vocabulary word not found.");

            _mapper.Map(dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Vocabularies.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<VocabularyDto>.Success(_mapper.Map<VocabularyDto>(entity), "Vocabulary word updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Vocabularies.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Vocabulary word not found.");

            _unitOfWork.Vocabularies.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Vocabulary word deleted.");
        }
        public async Task<Result> RecordInteractionAsync(
    Guid userId, CreateWordInteractionDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Chapters.AnyAsync(c => c.Id == dto.ChapterId, cancellationToken))
                return Result.Failure("Chapter not found.");

            if (dto.VocabularyId is null && string.IsNullOrWhiteSpace(dto.Word))
                return Result.Failure("Either VocabularyId or Word must be provided.");

            Guid? wordTranslationId = null;

            if (dto.VocabularyId is null)
            {
                var translationResult = await _translationService.TranslateAsync(
                    new Application.DTOs.Translation.TranslateWordRequestDto { Word = dto.Word! }, cancellationToken);

                if (!translationResult.IsSuccess)
                    return Result.Failure(translationResult.Error);

                var cached = await _unitOfWork.WordTranslations.GetByLemmaAsync(
                    translationResult.Value!.Lemma, "az", cancellationToken);

                wordTranslationId = cached?.Id;
            }
            else if (!await _unitOfWork.Vocabularies.AnyAsync(v => v.Id == dto.VocabularyId, cancellationToken))
            {
                return Result.Failure("Vocabulary word not found.");
            }

            var interaction = new Domain.Entities.WordInteraction
            {
                AppUserId = userId,
                ChapterId = dto.ChapterId,
                VocabularyId = dto.VocabularyId,
                WordTranslationId = wordTranslationId,
                InteractionType = dto.InteractionType,
            };

            await _unitOfWork.WordInteractions.AddAsync(interaction, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        private readonly ITranslationService _translationService;

        public VocabularyService(IUnitOfWork unitOfWork, IMapper mapper, ITranslationService translationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _translationService = translationService;
        }
        public async Task<Result<FlashcardPopupDto>> GetNextFlashcardAsync(
    Guid userId, CancellationToken cancellationToken = default)
        {
            var readChapterIds = (await _unitOfWork.ReadingHistories.GetByUserIdAsync(userId, cancellationToken))
                .Select(h => h.ChapterId)
                .Distinct()
                .ToList();

            var allVocabulary = new List<Domain.Entities.Vocabulary>();
            foreach (var chapterId in readChapterIds)
                allVocabulary.AddRange(await _unitOfWork.Vocabularies.GetByChapterIdAsync(chapterId, cancellationToken));

            if (allVocabulary.Count == 0)
            {
                var allResult = await GetAllAsync(userId, null, cancellationToken);
                if (allResult.IsSuccess && allResult.Value!.Count > 0)
                {
                    var allChs = await _unitOfWork.Chapters.GetAllAsync(cancellationToken);
                    foreach (var ch in allChs)
                        allVocabulary.AddRange(await _unitOfWork.Vocabularies.GetByChapterIdAsync(ch.Id, cancellationToken));
                }
            }

            var pool = allVocabulary.DistinctBy(v => v.Id).OrderBy(v => v.Word).ToList();
            if (pool.Count == 0)
                return Result<FlashcardPopupDto>.Failure("No vocabulary available yet.");

            var progress = await _unitOfWork.FlashcardProgresses.GetByUserIdAsync(userId, cancellationToken);
            if (progress is null)
            {
                progress = new Domain.Entities.FlashcardProgress { AppUserId = userId };
                await _unitOfWork.FlashcardProgresses.AddAsync(progress, cancellationToken);
            }

            var lastIndex = progress.LastShownVocabularyId.HasValue
                ? pool.FindIndex(v => v.Id == progress.LastShownVocabularyId.Value)
                : -1;

            var nextIndex = lastIndex + 1;
            if (nextIndex >= pool.Count)
            {
                nextIndex = 0;
                progress.CompletedCycles++;
            }

            var nextWord = pool[nextIndex];
            progress.LastShownVocabularyId = nextWord.Id;
            _unitOfWork.FlashcardProgresses.Update(progress);

            await _unitOfWork.FlashcardHistories.AddAsync(new Domain.Entities.FlashcardHistory
            {
                AppUserId = userId,
                VocabularyId = nextWord.Id,
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var definitions = await _unitOfWork.WordDefinitions.GetByVocabularyIdAsync(nextWord.Id, cancellationToken);
            var firstDefinition = definitions.FirstOrDefault();

            var translationResult = await _translationService.TranslateAsync(
                new Application.DTOs.Translation.TranslateWordRequestDto { Word = nextWord.Word }, cancellationToken);

            return Result<FlashcardPopupDto>.Success(new Application.DTOs.Vocabulary.FlashcardPopupDto
            {
                VocabularyId = nextWord.Id,
                Word = nextWord.Word,
                Translation = translationResult.IsSuccess ? translationResult.Value!.Translation : null,
                PronunciationAudioUrl = nextWord.AudioUrl,
                PartOfSpeech = firstDefinition?.PartOfSpeech,
                ExampleSentence = firstDefinition?.ExampleSentence,
                CurrentIndex = nextIndex + 1,
                TotalCount = pool.Count,
            });
        }
    }
}
