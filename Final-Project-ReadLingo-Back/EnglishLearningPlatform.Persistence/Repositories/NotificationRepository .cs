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
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<Notification>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.Where(n => n.AppUserId == userId).OrderByDescending(n => n.CreatedAt).ToListAsync(cancellationToken);

        public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default) =>
            await DbSet.CountAsync(n => n.AppUserId == userId && !n.IsRead, cancellationToken);
    }
}
