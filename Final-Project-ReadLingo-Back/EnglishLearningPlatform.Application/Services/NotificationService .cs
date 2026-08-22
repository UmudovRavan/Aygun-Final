using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Notification;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NotificationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IReadOnlyList<NotificationDto>>> GetByUserIdAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Notifications.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<NotificationDto>>.Success(_mapper.Map<IReadOnlyList<NotificationDto>>(items));
        }

        public async Task<Result<int>> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var count = await _unitOfWork.Notifications.GetUnreadCountAsync(userId, cancellationToken);
            return Result<int>.Success(count);
        }

        public async Task<Result> MarkAsReadAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Notifications.GetByIdAsync(id, cancellationToken);
            if (entity is null || entity.AppUserId != userId)
                return Result.Failure("Notification not found.");

            entity.IsRead = true;
            entity.ReadAt = DateTime.UtcNow;
            _unitOfWork.Notifications.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }

        public async Task<Result> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Notifications.GetByUserIdAsync(userId, cancellationToken);
            foreach (var item in items.Where(n => !n.IsRead))
            {
                item.IsRead = true;
                item.ReadAt = DateTime.UtcNow;
                _unitOfWork.Notifications.Update(item);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success("All notifications marked as read.");
        }

        public async Task<Result<NotificationDto>> CreateAsync(
            CreateNotificationDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Users.AnyAsync(u => u.Id == dto.AppUserId, cancellationToken))
                return Result<NotificationDto>.Failure("User not found.");

            var entity = _mapper.Map<Notification>(dto);
            await _unitOfWork.Notifications.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<NotificationDto>.Success(_mapper.Map<NotificationDto>(entity), "Notification sent.");
        }

        public async Task<Result> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Notifications.GetByIdAsync(id, cancellationToken);
            if (entity is null || entity.AppUserId != userId)
                return Result.Failure("Notification not found.");

            _unitOfWork.Notifications.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Notification deleted.");
        }
    }
}
