using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IRemainingCorrectCounterRepository : IGenericRepository<RemainingCorrectCounter>
    {
        Task<RemainingCorrectCounter?> GetByUserAndStoryAsync(
            Guid userId, Guid storyId, CancellationToken cancellationToken = default);
    }
}
