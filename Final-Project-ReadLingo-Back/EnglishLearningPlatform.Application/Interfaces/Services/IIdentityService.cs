using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IIdentityService
    {
        Task<(bool Succeeded, IEnumerable<string> Errors, Guid UserId)> RegisterAsync(
            string email, string password, string firstName, string lastName, string? nativeLanguage = null, string? learningLevel = null, int? dailyGoalMinutes = null);

        Task<bool> CheckPasswordAsync(string email, string password);

        Task<Guid?> GetUserIdByEmailAsync(string email);

        Task<IList<string>> GetRolesAsync(Guid userId);

        Task<bool> AddToRoleAsync(Guid userId, string role);

        Task<bool> RemoveFromRoleAsync(Guid userId, string role);

        Task<string> GenerateEmailConfirmationTokenAsync(Guid userId);

        Task<bool> ConfirmEmailAsync(Guid userId, string token);

        Task<string> GeneratePasswordResetTokenAsync(string email);

        Task<(bool Succeeded, IEnumerable<string> Errors)> ResetPasswordAsync(string email, string token, string newPassword);

        Task<(bool Succeeded, IEnumerable<string> Errors)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    }
}
