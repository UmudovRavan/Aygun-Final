using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Story;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EnglishLearningPlatform.Application.Interfaces.Services;

namespace EnglishLearningPlatform.Application.Services
{

    public class StoryService : IStoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PagedResult<StoryDto>>> GetAllAsync(
            StoryQueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var (items, totalCount) = await _unitOfWork.Stories.GetPagedAsync(
                parameters.PageNumber,
                parameters.PageSize,
                parameters.Search,
                parameters.StoryCategoryId,
                parameters.StoryLevelId,
                parameters.IsPublished,
                parameters.Language,
                parameters.SortBy,
                parameters.Descending,
                cancellationToken);

            var dto = new PagedResult<StoryDto>
            {
                Items = _mapper.Map<IReadOnlyList<StoryDto>>(items),
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
            };

            return Result<PagedResult<StoryDto>>.Success(dto);
        }

        public async Task<Result<StoryDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Stories.GetWithDetailsAsync(id, cancellationToken);
            if (entity is null)
                return Result<StoryDetailDto>.Failure("Story not found.");

            return Result<StoryDetailDto>.Success(_mapper.Map<StoryDetailDto>(entity));
        }

        public async Task<Result<StoryDetailDto>> CreateAsync(
            CreateStoryDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.StoryCategories.AnyAsync(c => c.Id == dto.StoryCategoryId, cancellationToken))
                return Result<StoryDetailDto>.Failure("Story category not found.");

            if (!await _unitOfWork.StoryLevels.AnyAsync(l => l.Id == dto.StoryLevelId, cancellationToken))
                return Result<StoryDetailDto>.Failure("Story level not found.");

            var entity = _mapper.Map<Story>(dto);
            entity.IsPublished = true;
            await _unitOfWork.Stories.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var created = await _unitOfWork.Stories.GetWithDetailsAsync(entity.Id, cancellationToken);
            return Result<StoryDetailDto>.Success(_mapper.Map<StoryDetailDto>(created), "Story created.");
        }

        public async Task<Result<StoryDetailDto>> UpdateAsync(
            Guid id, UpdateStoryDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Stories.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<StoryDetailDto>.Failure("Story not found.");

            if (!await _unitOfWork.StoryCategories.AnyAsync(c => c.Id == dto.StoryCategoryId, cancellationToken))
                return Result<StoryDetailDto>.Failure("Story category not found.");

            if (!await _unitOfWork.StoryLevels.AnyAsync(l => l.Id == dto.StoryLevelId, cancellationToken))
                return Result<StoryDetailDto>.Failure("Story level not found.");

            _mapper.Map(dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Stories.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var updated = await _unitOfWork.Stories.GetWithDetailsAsync(id, cancellationToken);
            return Result<StoryDetailDto>.Success(_mapper.Map<StoryDetailDto>(updated), "Story updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Stories.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Story not found.");

            
            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            _unitOfWork.Stories.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Story deleted.");
        }

        public async Task<Result> PublishAsync(Guid id, bool publish, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Stories.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Story not found.");

            entity.IsPublished = publish;
            entity.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Stories.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(publish ? "Story published." : "Story unpublished.");
        }

        private const int FreeDailyStoryLimit = 3;

        public async Task<Result> EnsureDailyReadAccessAsync(
            Guid userId, Guid storyId, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user != null && user.CurrentTier != Domain.Enums.SubscriptionTier.Free)
                return Result.Success();

            var subscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            if (subscription != null && subscription.Tier != Domain.Enums.SubscriptionTier.Free)
                return Result.Success(); 

            var today = DateTime.UtcNow.Date;
            var alreadyLoggedToday = await _unitOfWork.DailyStoryReadLogs.ExistsAsync(userId, storyId, today, cancellationToken);

            if (alreadyLoggedToday)
                return Result.Success(); 

            var countToday = await _unitOfWork.DailyStoryReadLogs.GetDistinctStoryCountForDateAsync(userId, today, cancellationToken);
            if (countToday >= FreeDailyStoryLimit)
                return Result.Failure($"Free plan allows {FreeDailyStoryLimit} stories per day. Upgrade to Pro for unlimited access.");

            await _unitOfWork.DailyStoryReadLogs.AddAsync(new Domain.Entities.DailyStoryReadLog
            {
                AppUserId = userId,
                StoryId = storyId,
                ReadDate = today,
            }, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
