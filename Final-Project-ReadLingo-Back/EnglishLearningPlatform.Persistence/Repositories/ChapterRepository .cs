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
    public class ChapterRepository : GenericRepository<Chapter>, IChapterRepository
    {
        public ChapterRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Chapter>> GetByStoryIdAsync(Guid storyId, CancellationToken cancellationToken = default) =>
            await DbSet.Where(c => c.StoryId == storyId).OrderBy(c => c.Order).ToListAsync(cancellationToken);
    }
}
