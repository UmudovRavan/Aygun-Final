using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IAppUserRepository : IGenericRepository<AppUser>
    {
        Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

        Task<AppUser?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
