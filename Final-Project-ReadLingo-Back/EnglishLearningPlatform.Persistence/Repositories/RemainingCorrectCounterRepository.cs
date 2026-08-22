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
    public class RemainingCorrectCounterRepository : GenericRepository<RemainingCorrectCounter>, IRemainingCorrectCounterRepository
    {
        public RemainingCorrectCounterRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<RemainingCorrectCounter?> GetByUserAndStoryAsync(
            Guid userId, Guid storyId, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(c => c.AppUserId == userId && c.StoryId == storyId, cancellationToken);
    }
}
