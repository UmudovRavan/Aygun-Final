using System.Security.Claims;

namespace EnglishLearningPlatform.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid? GetUserId(this ClaimsPrincipal principal)
        {
            var value = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(value, out var id) ? id : null;
        }

        public static string? GetEmail(this ClaimsPrincipal principal) =>
            principal.FindFirst(ClaimTypes.Email)?.Value;

        public static IEnumerable<string> GetRoles(this ClaimsPrincipal principal) =>
            principal.FindAll(ClaimTypes.Role).Select(c => c.Value);
    }
}
