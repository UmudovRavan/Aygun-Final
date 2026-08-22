using EnglishLearningPlatform.Application.DTOs.Admin;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<Result<PagedResult<AdminUserDto>>> GetAllAsync(AdminUserQueryParameters parameters, CancellationToken cancellationToken = default);
        Task<Result<AdminUserDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result> UpdateStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
        Task<Result> AssignRoleAsync(Guid id, string role, CancellationToken cancellationToken = default);
        Task<Result> RemoveRoleAsync(Guid id, string role, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<AdminDashboardStatsDto>> GetDashboardStatsAsync(CancellationToken cancellationToken = default);
    }
}
