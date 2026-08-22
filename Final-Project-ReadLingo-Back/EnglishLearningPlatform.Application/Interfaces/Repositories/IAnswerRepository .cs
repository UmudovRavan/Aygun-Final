using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface IAnswerRepository : IGenericRepository<Answer>
    {
        Task<IReadOnlyList<Answer>> GetByQuestionIdAsync(Guid questionId, CancellationToken cancellationToken = default);
    }
}
