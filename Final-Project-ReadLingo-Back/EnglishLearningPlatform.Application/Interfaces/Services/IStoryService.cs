using EnglishLearningPlatform.Application.DTOs.Story;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IStoryService
    {
        Task<Result<PagedResult<StoryDto>>> GetAllAsync(StoryQueryParameters parameters, CancellationToken cancellationToken = default);
        Task<Result<StoryDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<StoryDetailDto>> CreateAsync(CreateStoryDto dto, CancellationToken cancellationToken = default);
        Task<Result<StoryDetailDto>> UpdateAsync(Guid id, UpdateStoryDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result> PublishAsync(Guid id, bool publish, CancellationToken cancellationToken = default);
        Task<Result> EnsureDailyReadAccessAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default);
    }
}
