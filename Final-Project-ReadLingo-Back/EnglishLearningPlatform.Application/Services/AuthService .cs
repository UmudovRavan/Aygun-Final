using EnglishLearningPlatform.Application.Interfaces.Repositories;
using Microsoft.Extensions.Options;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EnglishLearningPlatform.Application.DTOs.Auth;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Common;

namespace EnglishLearningPlatform.Application.Services
{

    public class AuthService : IAuthService
    {
        private readonly IIdentityService _identityService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly ClientAppSettings _clientAppSettings;

        public AuthService(
            IIdentityService identityService,
            IJwtTokenService jwtTokenService,
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IOptions<ClientAppSettings> clientAppSettings)
        {
            _identityService = identityService;
            _jwtTokenService = jwtTokenService;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _clientAppSettings = clientAppSettings.Value;
        }

        public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
        {
            var (succeeded, errors, userId) = await _identityService.RegisterAsync(
                dto.Email, dto.Password, dto.FirstName, dto.LastName);

            if (!succeeded)
                return Result<AuthResponseDto>.Failure(string.Join("; ", errors));

            await _identityService.AddToRoleAsync(userId, "User");

            try
            {
                await SendEmailConfirmationAsync(userId, cancellationToken);
            }
            catch
            {
                
            }

            var response = await BuildAuthResponseAsync(userId, dto.Email, dto.FirstName, dto.LastName, ipAddress: null, cancellationToken);
            return Result<AuthResponseDto>.Success(response, "Registration successful. Please check your email to confirm your account.");
        }

        public async Task<Result<AuthResponseDto>> LoginAsync(
            LoginDto dto, string? ipAddress, CancellationToken cancellationToken = default)
        {
            var isValid = await _identityService.CheckPasswordAsync(dto.Email, dto.Password);
            if (!isValid)
                return Result<AuthResponseDto>.Failure("Invalid email or password.");

            var userId = await _identityService.GetUserIdByEmailAsync(dto.Email);
            if (userId is null)
                return Result<AuthResponseDto>.Failure("Invalid email or password.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
            if (user is null)
                return Result<AuthResponseDto>.Failure("Invalid email or password.");

            if (!user.IsActive)
                return Result<AuthResponseDto>.Failure("This account has been deactivated. Please contact support.");

            user.LastLoginAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = await BuildAuthResponseAsync(user.Id, user.Email!, user.FirstName, user.LastName, ipAddress, cancellationToken);
            return Result<AuthResponseDto>.Success(response, "Login successful.");
        }

        public async Task<Result<AuthResponseDto>> RefreshTokenAsync(
            RefreshTokenRequestDto dto, string? ipAddress, CancellationToken cancellationToken = default)
        {
            var principal = _jwtTokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
            var userIdClaim = principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
                return Result<AuthResponseDto>.Failure("Invalid access token.");

            var storedToken = (await _unitOfWork.Repository<RefreshToken>()
                    .FindAsync(t => t.Token == dto.RefreshToken && t.AppUserId == userId, cancellationToken))
                .FirstOrDefault();

            if (storedToken is null || !storedToken.IsActive)
                return Result<AuthResponseDto>.Failure("Invalid or expired refresh token.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null || !user.IsActive)
                return Result<AuthResponseDto>.Failure("Account not found or inactive.");

            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedByIp = ipAddress;

            var response = await BuildAuthResponseAsync(user.Id, user.Email!, user.FirstName, user.LastName, ipAddress, cancellationToken);
            storedToken.ReplacedByToken = response.RefreshToken;

            _unitOfWork.Repository<RefreshToken>().Update(storedToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<AuthResponseDto>.Success(response, "Token refreshed.");
        }

        public async Task<Result> RevokeTokenAsync(
            string refreshToken, string? ipAddress, CancellationToken cancellationToken = default)
        {
            var storedToken = (await _unitOfWork.Repository<RefreshToken>()
                    .FindAsync(t => t.Token == refreshToken, cancellationToken))
                .FirstOrDefault();

            if (storedToken is null || !storedToken.IsActive)
                return Result.Failure("Token not found or already inactive.");

            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedByIp = ipAddress;
            _unitOfWork.Repository<RefreshToken>().Update(storedToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Logged out successfully.");
        }

        public async Task<Result> ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default)
        {
            var userId = await _identityService.GetUserIdByEmailAsync(dto.Email);
            if (userId is null)
            {
                return Result.Success("If that email is registered, a password reset link has been sent.");
            }

            var token = await _identityService.GeneratePasswordResetTokenAsync(dto.Email);
            var encodedToken = Uri.EscapeDataString(token);
            var link = $"{_clientAppSettings.BaseUrl.TrimEnd('/')}{_clientAppSettings.ResetPasswordPath}?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

            await _emailService.SendEmailAsync(
                dto.Email,
                "Reset your Lingo password",
                $"<p>We received a request to reset your password.</p><p><a href=\"{link}\">Click here to reset it</a>. This link will expire soon.</p><p>If you didn't request this, you can safely ignore this email.</p>",
                cancellationToken);

            return Result.Success("If that email is registered, a password reset link has been sent.");
        }

        public async Task<Result> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default)
        {
            var (succeeded, errors) = await _identityService.ResetPasswordAsync(dto.Email, dto.Token, dto.NewPassword);
            return succeeded ? Result.Success("Password has been reset. You can now log in.") : Result.Failure(string.Join("; ", errors));
        }

        public async Task<Result> ConfirmEmailAsync(ConfirmEmailDto dto, CancellationToken cancellationToken = default)
        {
            var succeeded = await _identityService.ConfirmEmailAsync(dto.UserId, dto.Token);
            return succeeded ? Result.Success("Email confirmed successfully.") : Result.Failure("Invalid or expired confirmation token.");
        }

        public async Task<Result> SendEmailConfirmationAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            var token = await _identityService.GenerateEmailConfirmationTokenAsync(userId);
            var encodedToken = Uri.EscapeDataString(token);
            var link = $"{_clientAppSettings.BaseUrl.TrimEnd('/')}{_clientAppSettings.EmailConfirmationPath}?userId={userId}&token={encodedToken}";

            await _emailService.SendEmailAsync(
                user.Email!,
                "Confirm your Lingo account",
                $"<p>Welcome to Lingo!</p><p><a href=\"{link}\">Click here to confirm your email address</a>.</p>",
                cancellationToken);

            return Result.Success("Confirmation email sent.");
        }

        public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
        {
            var (succeeded, errors) = await _identityService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);
            return succeeded ? Result.Success("Password changed successfully.") : Result.Failure(string.Join("; ", errors));
        }

        private async Task<AuthResponseDto> BuildAuthResponseAsync(
            Guid userId, string email, string firstName, string lastName, string? ipAddress, CancellationToken cancellationToken)
        {
            var roles = await _identityService.GetRolesAsync(userId);

            var accessToken = _jwtTokenService.GenerateAccessToken(userId, email, roles);
            var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                AppUserId = userId,
                Token = refreshTokenValue,
                ExpiresAt = DateTime.UtcNow.Add(_jwtTokenService.RefreshTokenLifetime),
                CreatedByIp = ipAddress,
            };

            await _unitOfWork.Repository<RefreshToken>().AddAsync(refreshToken, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new AuthResponseDto
            {
                UserId = userId,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Roles = roles,
                AccessToken = accessToken,
                AccessTokenExpiresAt = DateTime.UtcNow.Add(_jwtTokenService.AccessTokenLifetime),
                RefreshToken = refreshTokenValue,
            };
        }
    }
}
