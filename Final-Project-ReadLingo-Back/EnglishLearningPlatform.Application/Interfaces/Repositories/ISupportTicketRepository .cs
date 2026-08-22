using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Repositories
{
    public interface ISupportTicketRepository : IGenericRepository<SupportTicket>
    {
        Task<IReadOnlyList<SupportTicket>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
