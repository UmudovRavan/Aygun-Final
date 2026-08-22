using EnglishLearningPlatform.Application.DTOs.Auth;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
        Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, string? ipAddress, CancellationToken cancellationToken = default);
        Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto dto, string? ipAddress, CancellationToken cancellationToken = default);
        Task<Result> RevokeTokenAsync(string refreshToken, string? ipAddress, CancellationToken cancellationToken = default);
        Task<Result> ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default);
        Task<Result> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default);
        Task<Result> ConfirmEmailAsync(ConfirmEmailDto dto, CancellationToken cancellationToken = default);
        Task<Result> SendEmailConfirmationAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);
    }
}
