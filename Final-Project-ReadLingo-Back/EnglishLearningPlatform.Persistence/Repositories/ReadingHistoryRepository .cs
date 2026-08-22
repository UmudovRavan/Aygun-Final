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
    public class ReadingHistoryRepository : GenericRepository<ReadingHistory>, IReadingHistoryRepository
    {
        public ReadingHistoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<ReadingHistory>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Include(h => h.Story).Include(h => h.Chapter)
                .Where(h => h.AppUserId == userId).OrderByDescending(h => h.LastReadAt).ToListAsync(cancellationToken);
    }
}
