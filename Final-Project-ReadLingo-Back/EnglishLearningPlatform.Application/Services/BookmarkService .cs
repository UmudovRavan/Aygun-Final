using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Bookmark;
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

    public class BookmarkService : IBookmarkService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public BookmarkService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<BookmarkDto>>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Bookmarks.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<BookmarkDto>>.Success(_mapper.Map<IReadOnlyList<BookmarkDto>>(items));
        }

        public async Task<Result<BookmarkDto>> GetByIdAsync(
            Guid id, Guid userId, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
            if (entity is null || entity.AppUserId != userId)
                return Result<BookmarkDto>.Failure("Bookmark not found.");

            return Result<BookmarkDto>.Success(_mapper.Map<BookmarkDto>(entity));
        }

        public async Task<Result<BookmarkDto>> CreateAsync(
            Guid userId, CreateBookmarkDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Chapters.AnyAsync(c => c.Id == dto.ChapterId, cancellationToken))
                return Result<BookmarkDto>.Failure("Chapter not found.");

            var entity = _mapper.Map<Bookmark>(dto);
            entity.AppUserId = userId;
            await _unitOfWork.Bookmarks.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<BookmarkDto>.Success(_mapper.Map<BookmarkDto>(entity), "Bookmark created.");
        }

        public async Task<Result<BookmarkDto>> UpdateAsync(
            Guid id, Guid userId, UpdateBookmarkDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
            if (entity is null || entity.AppUserId != userId)
                return Result<BookmarkDto>.Failure("Bookmark not found.");

            _mapper.Map(dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Bookmarks.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<BookmarkDto>.Success(_mapper.Map<BookmarkDto>(entity), "Bookmark updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
            if (entity is null || entity.AppUserId != userId)
                return Result.Failure("Bookmark not found.");

            _unitOfWork.Bookmarks.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Bookmark deleted.");
        }
    }
}
