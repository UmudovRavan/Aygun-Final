using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.DTOs.StoryLevel;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IStoryLevelService
    {
        Task<Result<PagedResult<StoryLevelDto>>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default);
        Task<Result<StoryLevelDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<StoryLevelDto>> CreateAsync(CreateStoryLevelDto dto, CancellationToken cancellationToken = default);
        Task<Result<StoryLevelDto>> UpdateAsync(Guid id, UpdateStoryLevelDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
