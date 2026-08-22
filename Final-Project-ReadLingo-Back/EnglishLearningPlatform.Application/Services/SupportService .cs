using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.DTOs.Support;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class SupportService : ISupportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SupportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<SupportTicketDto>>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.SupportTickets.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<SupportTicketDto>>.Success(_mapper.Map<IReadOnlyList<SupportTicketDto>>(items));
        }

        public async Task<Result<PagedResult<SupportTicketDto>>> GetAllAsync(
            QueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var (items, totalCount) = await _unitOfWork.SupportTickets.GetPagedAsync(
                parameters.PageNumber,
                parameters.PageSize,
                predicate: string.IsNullOrWhiteSpace(parameters.Search)
                    ? null
                    : t => t.Subject.Contains(parameters.Search),
                orderBy: q => parameters.Descending
                    ? q.OrderByDescending(t => t.CreatedAt)
                    : q.OrderBy(t => t.CreatedAt),
                cancellationToken: cancellationToken);

            var dto = new PagedResult<SupportTicketDto>
            {
                Items = _mapper.Map<IReadOnlyList<SupportTicketDto>>(items),
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
            };

            return Result<PagedResult<SupportTicketDto>>.Success(dto);
        }

        public async Task<Result<SupportTicketDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.SupportTickets.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<SupportTicketDto>.Failure("Support ticket not found.");

            return Result<SupportTicketDto>.Success(_mapper.Map<SupportTicketDto>(entity));
        }

        public async Task<Result<SupportTicketDto>> CreateAsync(
            Guid userId, CreateSupportTicketDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<SupportTicket>(dto);
            entity.AppUserId = userId;
            entity.Status = SupportTicketStatus.Open;
            await _unitOfWork.SupportTickets.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<SupportTicketDto>.Success(_mapper.Map<SupportTicketDto>(entity), "Support ticket created.");
        }

        public async Task<Result<SupportTicketDto>> UpdateAsync(
            Guid id, UpdateSupportTicketDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.SupportTickets.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<SupportTicketDto>.Failure("Support ticket not found.");

            entity.Status = dto.Status;
            entity.Priority = dto.Priority;
            entity.AdminResponse = dto.AdminResponse;
            if (dto.Status is SupportTicketStatus.Resolved or SupportTicketStatus.Closed && entity.ResolvedAt is null)
                entity.ResolvedAt = DateTime.UtcNow;

            _unitOfWork.SupportTickets.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<SupportTicketDto>.Success(_mapper.Map<SupportTicketDto>(entity), "Support ticket updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.SupportTickets.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Support ticket not found.");

            _unitOfWork.SupportTickets.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Support ticket deleted.");
        }
    }
}
