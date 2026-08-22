using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Progress;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class ProgressService : IProgressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProgressService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<UserProgressDto>>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.UserProgresses.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<UserProgressDto>>.Success(_mapper.Map<IReadOnlyList<UserProgressDto>>(items));
        }

        public async Task<Result<UserProgressDto>> UpsertAsync(
            Guid userId, UpsertUserProgressDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Stories.AnyAsync(s => s.Id == dto.StoryId, cancellationToken))
                return Result<UserProgressDto>.Failure("Story not found.");

            var entity = await _unitOfWork.UserProgresses.GetByUserAndStoryAsync(userId, dto.StoryId, cancellationToken);
            var wasNewlyCompleted = false;
            if (entity is null)
            {
                entity = new UserProgress
                {
                    AppUserId = userId,
                    StoryId = dto.StoryId,
                    ChapterId = dto.ChapterId,
                    ProgressPercentage = dto.ProgressPercentage,
                    IsCompleted = dto.IsCompleted,
                    CompletedAt = dto.IsCompleted ? DateTime.UtcNow : null,
                };
                await _unitOfWork.UserProgresses.AddAsync(entity, cancellationToken);
                if (dto.IsCompleted) wasNewlyCompleted = true;
            }
            else
            {
                entity.ChapterId = dto.ChapterId;
                entity.ProgressPercentage = dto.ProgressPercentage;
                if (dto.IsCompleted && !entity.IsCompleted)
                {
                    entity.CompletedAt = DateTime.UtcNow;
                    wasNewlyCompleted = true;
                }
                entity.IsCompleted = dto.IsCompleted;
                _unitOfWork.UserProgresses.Update(entity);
            }

            if (wasNewlyCompleted)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
                if (user != null)
                {
                    user.TotalXp += 50;
                    _unitOfWork.Users.Update(user);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<UserProgressDto>.Success(_mapper.Map<UserProgressDto>(entity), "Progress saved.");
        }

        public async Task<Result<IReadOnlyList<ReadingHistoryDto>>> GetReadingHistoryAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.ReadingHistories.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<ReadingHistoryDto>>.Success(_mapper.Map<IReadOnlyList<ReadingHistoryDto>>(items));
        }

        public async Task<Result<ReadingHistoryDto>> RecordReadingAsync(
            Guid userId, RecordReadingDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Chapters.AnyAsync(c => c.Id == dto.ChapterId, cancellationToken))
                return Result<ReadingHistoryDto>.Failure("Chapter not found.");

            var entity = new ReadingHistory
            {
                AppUserId = userId,
                StoryId = dto.StoryId,
                ChapterId = dto.ChapterId,
                ReadingPositionPercentage = dto.ReadingPositionPercentage,
                LastReadAt = DateTime.UtcNow,
            };

            await _unitOfWork.ReadingHistories.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<ReadingHistoryDto>.Success(_mapper.Map<ReadingHistoryDto>(entity), "Reading recorded.");
        }

        public async Task<Result<StreakStatusDto>> RecordDailyActivityAsync(
    Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result<StreakStatusDto>.Failure("User not found.");

            var today = DateTime.UtcNow.Date;

            if (user.LastStreakDate?.Date == today)
            {
               
            }
            else if (user.LastStreakDate?.Date == today.AddDays(-1))
            {
                user.CurrentStreak++;
            }
            else
            {
                user.CurrentStreak = 1; 
            }

            user.LongestStreak = Math.Max(user.LongestStreak, user.CurrentStreak);
            user.LastStreakDate = today;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<StreakStatusDto>.Success(new Application.DTOs.Progress.StreakStatusDto
            {
                CurrentStreak = user.CurrentStreak,
                LongestStreak = user.LongestStreak,
                LastStreakDate = user.LastStreakDate,
            });
        }
    }
}
