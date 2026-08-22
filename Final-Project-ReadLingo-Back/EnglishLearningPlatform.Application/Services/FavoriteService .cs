using AutoMapper;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EnglishLearningPlatform.Application.DTOs.Favorite;
using EnglishLearningPlatform.Application.Interfaces.Services;

namespace EnglishLearningPlatform.Application.Services
{

    public class FavoriteService : IFavoriteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public FavoriteService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<FavoriteStoryDto>>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.FavoriteStories.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<FavoriteStoryDto>>.Success(_mapper.Map<IReadOnlyList<FavoriteStoryDto>>(items));
        }

        public async Task<Result<FavoriteStoryDto>> AddAsync(
            Guid userId, CreateFavoriteStoryDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Stories.AnyAsync(s => s.Id == dto.StoryId, cancellationToken))
                return Result<FavoriteStoryDto>.Failure("Story not found.");

            var existing = await _unitOfWork.FavoriteStories.GetByUserAndStoryAsync(userId, dto.StoryId, cancellationToken);
            if (existing != null)
                return Result<FavoriteStoryDto>.Failure("Story is already in your favorites.");

            var entity = new FavoriteStory { AppUserId = userId, StoryId = dto.StoryId };
            await _unitOfWork.FavoriteStories.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var created = await _unitOfWork.FavoriteStories.GetByUserAndStoryAsync(userId, dto.StoryId, cancellationToken);
            return Result<FavoriteStoryDto>.Success(_mapper.Map<FavoriteStoryDto>(created), "Story added to favorites.");
        }

        public async Task<Result> RemoveAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.FavoriteStories.GetByUserAndStoryAsync(userId, storyId, cancellationToken);
            if (entity is null)
                return Result.Failure("Story is not in your favorites.");

            _unitOfWork.FavoriteStories.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Story removed from favorites.");
        }
    }

}
