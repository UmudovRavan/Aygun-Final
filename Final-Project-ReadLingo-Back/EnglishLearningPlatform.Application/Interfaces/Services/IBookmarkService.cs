using EnglishLearningPlatform.Application.DTOs.Bookmark;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IBookmarkService
    {
        Task<Result<IReadOnlyList<BookmarkDto>>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<BookmarkDto>> GetByIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
        Task<Result<BookmarkDto>> CreateAsync(Guid userId, CreateBookmarkDto dto, CancellationToken cancellationToken = default);
        Task<Result<BookmarkDto>> UpdateAsync(Guid id, Guid userId, UpdateBookmarkDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    }
}
