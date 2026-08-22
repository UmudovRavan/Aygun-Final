using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.DTOs.Support;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface ISupportService
    {
        Task<Result<IReadOnlyList<SupportTicketDto>>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<PagedResult<SupportTicketDto>>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default);
        Task<Result<SupportTicketDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<SupportTicketDto>> CreateAsync(Guid userId, CreateSupportTicketDto dto, CancellationToken cancellationToken = default);
        Task<Result<SupportTicketDto>> UpdateAsync(Guid id, UpdateSupportTicketDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
