using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.Identity
{

    public class IdentityService : IIdentityService
    {
        private readonly UserManager<AppUser> _userManager;

        public IdentityService(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<(bool Succeeded, IEnumerable<string> Errors, Guid UserId)> RegisterAsync(
            string email, string password, string firstName, string lastName)
        {
            var username = !string.IsNullOrWhiteSpace(firstName) && !firstName.Contains('@')
                ? firstName
                : (email.Contains('@') ? email.Split('@')[0] : email);

            var user = new AppUser
            {
                UserName = username,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
            };

            var result = await _userManager.CreateAsync(user, password);

            return (result.Succeeded, result.Errors.Select(e => e.Description), user.Id);
        }

        public async Task<bool> CheckPasswordAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null)
                return false;

            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<Guid?> GetUserIdByEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user?.Id;
        }

        public async Task<IList<string>> GetRolesAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                return new List<string>();

            return await _userManager.GetRolesAsync(user);
        }

        public async Task<bool> AddToRoleAsync(Guid userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                return false;

            if (await _userManager.IsInRoleAsync(user, role))
                return true;

            var result = await _userManager.AddToRoleAsync(user, role);
            return result.Succeeded;
        }

        public async Task<bool> RemoveFromRoleAsync(Guid userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                return false;

            var result = await _userManager.RemoveFromRoleAsync(user, role);
            return result.Succeeded;
        }

        public async Task<string> GenerateEmailConfirmationTokenAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                return string.Empty;

            return await _userManager.GenerateEmailConfirmationTokenAsync(user);
        }

        public async Task<bool> ConfirmEmailAsync(Guid userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                return false;

            var result = await _userManager.ConfirmEmailAsync(user, token);
            return result.Succeeded;
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null)
                return string.Empty;

            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task<(bool Succeeded, IEnumerable<string> Errors)> ResetPasswordAsync(
            string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null)
                return (false, new[] { "Invalid email or token." });

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            return (result.Succeeded, result.Errors.Select(e => e.Description));
        }

        public async Task<(bool Succeeded, IEnumerable<string> Errors)> ChangePasswordAsync(
            Guid userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                return (false, new[] { "User not found." });

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            return (result.Succeeded, result.Errors.Select(e => e.Description));
        }
    }

}
