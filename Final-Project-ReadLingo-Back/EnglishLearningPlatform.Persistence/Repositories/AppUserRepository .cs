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
    public class AppUserRepository : GenericRepository<AppUser>, IAppUserRepository
    {
        public AppUserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);

        public async Task<AppUser?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default) =>
            await DbSet.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }
}
