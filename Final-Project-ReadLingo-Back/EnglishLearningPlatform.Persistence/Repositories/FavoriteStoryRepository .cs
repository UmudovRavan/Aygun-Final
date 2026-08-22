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
    public class FavoriteStoryRepository : GenericRepository<FavoriteStory>, IFavoriteStoryRepository
    {
        public FavoriteStoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<FavoriteStory?> GetByUserAndStoryAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(f => f.AppUserId == userId && f.StoryId == storyId, cancellationToken);

        public async Task<IReadOnlyList<FavoriteStory>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(f => f.Story).Where(f => f.AppUserId == userId).ToListAsync(cancellationToken);
    }

}
