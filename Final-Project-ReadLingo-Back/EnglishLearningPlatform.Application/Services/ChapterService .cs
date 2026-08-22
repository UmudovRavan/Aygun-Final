using AutoMapper;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EnglishLearningPlatform.Application.DTOs.Chapter;
using EnglishLearningPlatform.Application.Interfaces.Services;

namespace EnglishLearningPlatform.Application.Services
{

    public class ChapterService : IChapterService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ChapterService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<ChapterDto>>> GetByStoryIdAsync(
            Guid storyId, CancellationToken cancellationToken = default)
        {
            var chapters = await _unitOfWork.Chapters.GetByStoryIdAsync(storyId, cancellationToken);
            return Result<IReadOnlyList<ChapterDto>>.Success(_mapper.Map<IReadOnlyList<ChapterDto>>(chapters));
        }

        public async Task<Result<ChapterDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Chapters.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<ChapterDto>.Failure("Chapter not found.");

            return Result<ChapterDto>.Success(_mapper.Map<ChapterDto>(entity));
        }

        public async Task<Result<ChapterDto>> CreateAsync(
            CreateChapterDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Stories.AnyAsync(s => s.Id == dto.StoryId, cancellationToken))
                return Result<ChapterDto>.Failure("Story not found.");

            var entity = _mapper.Map<Chapter>(dto);
            await _unitOfWork.Chapters.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<ChapterDto>.Success(_mapper.Map<ChapterDto>(entity), "Chapter created.");
        }

        public async Task<Result<ChapterDto>> UpdateAsync(
            Guid id, UpdateChapterDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Chapters.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<ChapterDto>.Failure("Chapter not found.");

            _mapper.Map(dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Chapters.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<ChapterDto>.Success(_mapper.Map<ChapterDto>(entity), "Chapter updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Chapters.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Chapter not found.");

            _unitOfWork.Chapters.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Chapter deleted.");
        }
        public async Task<Result<ReadAloudDto>> GetReadAloudAsync(
    Guid chapterId, string? voiceId = null, string? languageCode = null, CancellationToken cancellationToken = default)
        {
            var chapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId, cancellationToken);
            if (chapter is null)
                return Result<ReadAloudDto>.Failure("Chapter not found.");

            return Result<ReadAloudDto>.Success(new ReadAloudDto
            {
                ChapterId = chapter.Id,
                FullText = chapter.Content,
                Sentences = SplitIntoSentences(chapter.Content),
                LanguageCode = languageCode ?? "en-US",
                VoiceId = voiceId,
            });
        }

        private static List<string> SplitIntoSentences(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return new List<string>();

            var matches = System.Text.RegularExpressions.Regex.Matches(
                text, @"[^.!?]+[.!?]+(?=\s+|$)", System.Text.RegularExpressions.RegexOptions.Singleline);

            var sentences = matches.Select(m => m.Value.Trim()).Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
            return sentences.Count > 0 ? sentences : new List<string> { text.Trim() };
        }

        public async Task<Result> EnsureCanAccessChapterAsync(
    Guid userId, Guid chapterId, CancellationToken cancellationToken = default)
        {
            var chapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId, cancellationToken);
            if (chapter is null)
                return Result.Failure("Chapter not found.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            var subscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            var isUnlimitedHearts = subscription != null && subscription.Tier != Domain.Enums.SubscriptionTier.Free;

            if (!isUnlimitedHearts && user.Hearts <= 0)
                return Result.Failure("You are out of hearts. Wait for a heart to recover or upgrade to Pro/Premium for unlimited hearts.");

            if (chapter.Order <= 1)
                return Result.Success();

            var allChapters = await _unitOfWork.Chapters.GetByStoryIdAsync(chapter.StoryId, cancellationToken);
            var previousChapter = allChapters
                .Where(c => c.Order < chapter.Order)
                .OrderByDescending(c => c.Order)
                .FirstOrDefault();

            if (previousChapter is null)
                return Result.Success();

            var progress = await _unitOfWork.UserProgresses.GetByUserAndStoryAsync(userId, chapter.StoryId, cancellationToken);
            var previousCompleted = progress != null && progress.ChapterId == previousChapter.Id && progress.IsCompleted;

            return previousCompleted
                ? Result.Success()
                : Result.Failure("You must complete the quiz for the previous page before continuing.");
        }
    }

}
