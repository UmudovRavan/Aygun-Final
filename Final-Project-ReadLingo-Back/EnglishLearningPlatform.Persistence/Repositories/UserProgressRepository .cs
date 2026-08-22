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

    public class UserProgressRepository : GenericRepository<UserProgress>, IUserProgressRepository
    {
        public UserProgressRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<UserProgress?> GetByUserAndStoryAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(p => p.AppUserId == userId && p.StoryId == storyId, cancellationToken);

        public async Task<IReadOnlyList<UserProgress>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(p => p.Story).Where(p => p.AppUserId == userId).ToListAsync(cancellationToken);
    }
}
