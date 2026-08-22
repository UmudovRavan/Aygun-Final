using EnglishLearningPlatform.Application.DTOs.Favorite;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IFavoriteService
    {
        Task<Result<IReadOnlyList<FavoriteStoryDto>>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<FavoriteStoryDto>> AddAsync(Guid userId, CreateFavoriteStoryDto dto, CancellationToken cancellationToken = default);
        Task<Result> RemoveAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default);
    }
}
