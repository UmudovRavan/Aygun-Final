using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IUserProgressRepository : IGenericRepository<UserProgress>
    {
        Task<UserProgress?> GetByUserAndStoryAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<UserProgress>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
