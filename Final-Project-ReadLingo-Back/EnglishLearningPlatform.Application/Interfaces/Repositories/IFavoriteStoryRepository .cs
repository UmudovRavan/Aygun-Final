using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IFavoriteStoryRepository : IGenericRepository<FavoriteStory>
    {
        Task<FavoriteStory?> GetByUserAndStoryAsync(Guid userId, Guid storyId, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<FavoriteStory>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
