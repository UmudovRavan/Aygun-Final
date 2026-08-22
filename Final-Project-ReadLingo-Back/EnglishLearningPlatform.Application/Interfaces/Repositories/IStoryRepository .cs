using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{

    public interface IStoryRepository : IGenericRepository<Story>
    {
        Task<Story?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
        IQueryable<Story> GetPublishedQueryable();

        Task<(IReadOnlyList<Story> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            Guid? storyCategoryId,
            Guid? storyLevelId,
            bool? isPublished,
            string? language,
            string? sortBy,
            bool descending,
            CancellationToken cancellationToken = default);
    }
}
