using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EnglishLearningPlatform.Application.DTOs.StoryLevel;
using EnglishLearningPlatform.Application.Interfaces.Services;

namespace EnglishLearningPlatform.Application.Services
{

    public class StoryLevelService : IStoryLevelService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StoryLevelService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PagedResult<StoryLevelDto>>> GetAllAsync(
            QueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var (items, totalCount) = await _unitOfWork.StoryLevels.GetPagedAsync(
                parameters.PageNumber,
                parameters.PageSize,
                predicate: string.IsNullOrWhiteSpace(parameters.Search)
                    ? null
                    : l => l.Name.Contains(parameters.Search),
                orderBy: q => parameters.Descending ? q.OrderByDescending(l => l.Order) : q.OrderBy(l => l.Order),
                cancellationToken: cancellationToken);

            var dto = new PagedResult<StoryLevelDto>
            {
                Items = _mapper.Map<IReadOnlyList<StoryLevelDto>>(items),
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
            };

            return Result<PagedResult<StoryLevelDto>>.Success(dto);
        }

        public async Task<Result<StoryLevelDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StoryLevels.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<StoryLevelDto>.Failure("Story level not found.");

            return Result<StoryLevelDto>.Success(_mapper.Map<StoryLevelDto>(entity));
        }

        public async Task<Result<StoryLevelDto>> CreateAsync(
            CreateStoryLevelDto dto, CancellationToken cancellationToken = default)
        {
            if (await _unitOfWork.StoryLevels.AnyAsync(l => l.Name == dto.Name, cancellationToken))
                return Result<StoryLevelDto>.Failure("A level with this name already exists.");

            var entity = _mapper.Map<StoryLevel>(dto);
            await _unitOfWork.StoryLevels.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<StoryLevelDto>.Success(_mapper.Map<StoryLevelDto>(entity), "Level created.");
        }

        public async Task<Result<StoryLevelDto>> UpdateAsync(
            Guid id, UpdateStoryLevelDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StoryLevels.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<StoryLevelDto>.Failure("Story level not found.");

            _mapper.Map(dto, entity);
            _unitOfWork.StoryLevels.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<StoryLevelDto>.Success(_mapper.Map<StoryLevelDto>(entity), "Level updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StoryLevels.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Story level not found.");

            if (await _unitOfWork.Stories.AnyAsync(s => s.StoryLevelId == id, cancellationToken))
                return Result.Failure("Cannot delete a level that still has stories assigned to it.");

            _unitOfWork.StoryLevels.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Level deleted.");
        }
    }
}
