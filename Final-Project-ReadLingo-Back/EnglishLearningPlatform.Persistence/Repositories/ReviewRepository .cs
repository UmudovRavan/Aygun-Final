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

    public class ReviewRepository : GenericRepository<Review>, IReviewRepository
    {
        public ReviewRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Review>> GetByStoryIdAsync(Guid storyId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(r => r.AppUser).Where(r => r.StoryId == storyId).OrderByDescending(r => r.CreatedAt).ToListAsync(cancellationToken);
    }
}
