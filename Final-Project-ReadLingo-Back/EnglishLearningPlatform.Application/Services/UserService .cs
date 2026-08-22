using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Admin;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{

    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IIdentityService identityService, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _identityService = identityService;
            _mapper = mapper;
        }

        public async Task<Result<PagedResult<AdminUserDto>>> GetAllAsync(
            AdminUserQueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var (items, totalCount) = await _unitOfWork.Users.GetPagedAsync(
                parameters.PageNumber,
                parameters.PageSize,
                predicate: BuildPredicate(parameters),
                orderBy: q => parameters.Descending
                    ? q.OrderByDescending(u => u.CreatedAt)
                    : q.OrderBy(u => u.CreatedAt),
                cancellationToken: cancellationToken);

            var dtos = new List<AdminUserDto>();
            foreach (var user in items)
            {
                var dto = _mapper.Map<AdminUserDto>(user);
                dto.Roles = await _identityService.GetRolesAsync(user.Id);
                if (parameters.Role is null || dto.Roles.Contains(parameters.Role))
                    dtos.Add(dto);
            }

            var result = new PagedResult<AdminUserDto>
            {
                Items = dtos,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
            };

            return Result<PagedResult<AdminUserDto>>.Success(result);
        }

        private static System.Linq.Expressions.Expression<Func<Domain.Entities.AppUser, bool>>? BuildPredicate(
            AdminUserQueryParameters parameters)
        {
            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var term = parameters.Search;
                return u => u.Email!.Contains(term) || u.FirstName.Contains(term) || u.LastName.Contains(term);
            }

            if (parameters.IsActive.HasValue)
            {
                var isActive = parameters.IsActive.Value;
                return u => u.IsActive == isActive;
            }

            return null;
        }

        public async Task<Result<AdminUserDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user is null)
                return Result<AdminUserDto>.Failure("User not found.");

            var dto = _mapper.Map<AdminUserDto>(user);
            dto.Roles = await _identityService.GetRolesAsync(user.Id);

            return Result<AdminUserDto>.Success(dto);
        }

        public async Task<Result> UpdateStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(isActive ? "User activated." : "User deactivated.");
        }

        public async Task<Result> AssignRoleAsync(Guid id, string role, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            var succeeded = await _identityService.AddToRoleAsync(id, role);
            return succeeded ? Result.Success($"Role '{role}' assigned.") : Result.Failure("Failed to assign role.");
        }

        public async Task<Result> RemoveRoleAsync(Guid id, string role, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            var succeeded = await _identityService.RemoveFromRoleAsync(id, role);
            return succeeded ? Result.Success($"Role '{role}' removed.") : Result.Failure("Failed to remove role.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            _unitOfWork.Users.Remove(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("User deleted.");
        }

        public async Task<Result<AdminDashboardStatsDto>> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
        {
            var stats = new AdminDashboardStatsDto
            {
                TotalUsers = await _unitOfWork.Users.CountAsync(cancellationToken: cancellationToken),
                ActiveSubscriptions = await _unitOfWork.Subscriptions.CountAsync(s => s.IsActive, cancellationToken),
                TotalStories = await _unitOfWork.Stories.CountAsync(cancellationToken: cancellationToken),
                PublishedStories = await _unitOfWork.Stories.CountAsync(s => s.IsPublished, cancellationToken),
                OpenSupportTickets = await _unitOfWork.SupportTickets.CountAsync(
                    t => t.Status == Domain.Enums.SupportTicketStatus.Open, cancellationToken),
            };

            var payments = await _unitOfWork.Payments.FindAsync(
                p => p.Status == Domain.Enums.PaymentStatus.Completed, cancellationToken);
            stats.TotalRevenue = payments.Sum(p => p.Amount);

            return Result<AdminDashboardStatsDto>.Success(stats);
        }
    }

}
