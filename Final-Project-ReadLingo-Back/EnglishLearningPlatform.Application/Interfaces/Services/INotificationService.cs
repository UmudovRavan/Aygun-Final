using EnglishLearningPlatform.Application.DTOs.Notification;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface INotificationService
    {
        Task<Result<IReadOnlyList<NotificationDto>>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<int>> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result> MarkAsReadAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
        Task<Result> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<NotificationDto>> CreateAsync(CreateNotificationDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    }
}
