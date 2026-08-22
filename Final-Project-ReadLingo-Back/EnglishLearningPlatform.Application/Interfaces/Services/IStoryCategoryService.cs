using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.DTOs.StoryCategory;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IStoryCategoryService
    {
        Task<Result<PagedResult<StoryCategoryDto>>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default);
        Task<Result<StoryCategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<StoryCategoryDto>> CreateAsync(CreateStoryCategoryDto dto, CancellationToken cancellationToken = default);
        Task<Result<StoryCategoryDto>> UpdateAsync(Guid id, UpdateStoryCategoryDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
