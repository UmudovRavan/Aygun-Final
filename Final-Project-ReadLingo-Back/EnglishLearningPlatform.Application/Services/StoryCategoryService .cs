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
using EnglishLearningPlatform.Application.DTOs.StoryCategory;
using EnglishLearningPlatform.Application.Interfaces.Services;

using Microsoft.EntityFrameworkCore;

namespace EnglishLearningPlatform.Application.Services
{

    public class StoryCategoryService : IStoryCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StoryCategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<PagedResult<StoryCategoryDto>>> GetAllAsync(
            QueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var query = _unitOfWork.StoryCategories.Query()
                .Include(c => c.Stories)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var term = parameters.Search.Trim();
                query = query.Where(c => c.Name.Contains(term));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            query = parameters.Descending
                ? query.OrderByDescending(c => c.Name)
                : query.OrderBy(c => c.Name);

            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync(cancellationToken);

            var dto = new PagedResult<StoryCategoryDto>
            {
                Items = _mapper.Map<IReadOnlyList<StoryCategoryDto>>(items),
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
            };

            return Result<PagedResult<StoryCategoryDto>>.Success(dto);
        }

        public async Task<Result<StoryCategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StoryCategories.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<StoryCategoryDto>.Failure("Story category not found.");

            return Result<StoryCategoryDto>.Success(_mapper.Map<StoryCategoryDto>(entity));
        }

        public async Task<Result<StoryCategoryDto>> CreateAsync(
            CreateStoryCategoryDto dto, CancellationToken cancellationToken = default)
        {
            if (await _unitOfWork.StoryCategories.AnyAsync(c => c.Name == dto.Name, cancellationToken))
                return Result<StoryCategoryDto>.Failure("A category with this name already exists.");

            var entity = _mapper.Map<StoryCategory>(dto);
            await _unitOfWork.StoryCategories.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<StoryCategoryDto>.Success(_mapper.Map<StoryCategoryDto>(entity), "Category created.");
        }

        public async Task<Result<StoryCategoryDto>> UpdateAsync(
            Guid id, UpdateStoryCategoryDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StoryCategories.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<StoryCategoryDto>.Failure("Story category not found.");

            _mapper.Map(dto, entity);
            _unitOfWork.StoryCategories.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<StoryCategoryDto>.Success(_mapper.Map<StoryCategoryDto>(entity), "Category updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StoryCategories.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Story category not found.");

            if (await _unitOfWork.Stories.AnyAsync(s => s.StoryCategoryId == id, cancellationToken))
                return Result.Failure("Cannot delete a category that still has stories assigned to it.");

            _unitOfWork.StoryCategories.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Category deleted.");
        }
    }
}
