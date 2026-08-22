using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Repositories
{

    public class StoryRepository : GenericRepository<Story>, IStoryRepository
    {
        public StoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Story?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default) =>
            await DbSet
                .Include(s => s.StoryCategory)
                .Include(s => s.StoryLevel)
                .Include(s => s.Chapters.OrderBy(c => c.Order))
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        public IQueryable<Story> GetPublishedQueryable() =>
            DbSet.Include(s => s.StoryCategory).Include(s => s.StoryLevel).Where(s => s.IsPublished);

        public async Task<(IReadOnlyList<Story> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            Guid? storyCategoryId,
            Guid? storyLevelId,
            bool? isPublished,
            string? language,
            string? sortBy,
            bool descending,
            CancellationToken cancellationToken = default)
        {
            var query = DbSet
                .Include(s => s.StoryCategory)
                .Include(s => s.StoryLevel)
                .Include(s => s.Chapters)
                .Include(s => s.Reviews)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(s => s.Title.Contains(term) || (s.Description != null && s.Description.Contains(term)));
            }

            if (storyCategoryId.HasValue)
                query = query.Where(s => s.StoryCategoryId == storyCategoryId.Value);

            if (storyLevelId.HasValue)
                query = query.Where(s => s.StoryLevelId == storyLevelId.Value);

            if (isPublished.HasValue)
                query = query.Where(s => s.IsPublished == isPublished.Value);

            if (!string.IsNullOrWhiteSpace(language))
                query = query.Where(s => s.Language == language);

            var totalCount = await query.CountAsync(cancellationToken);

            query = sortBy?.ToLowerInvariant() switch
            {
                "title" => descending ? query.OrderByDescending(s => s.Title) : query.OrderBy(s => s.Title),
                "estimatedminutes" => descending ? query.OrderByDescending(s => s.EstimatedMinutes) : query.OrderBy(s => s.EstimatedMinutes),
                _ => descending ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt),
            };

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }
    }
}
