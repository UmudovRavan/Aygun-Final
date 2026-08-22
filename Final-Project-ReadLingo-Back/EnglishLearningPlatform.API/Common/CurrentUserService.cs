using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.Interfaces.Services;

namespace EnglishLearningPlatform.API.Common
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private Microsoft.AspNetCore.Http.HttpContext? Context => _httpContextAccessor.HttpContext;

        public Guid? UserId => Context?.User?.GetUserId();

        public string? Email => Context?.User?.GetEmail();

        public bool IsAuthenticated => Context?.User?.Identity?.IsAuthenticated ?? false;

        public IEnumerable<string> Roles => Context?.User?.GetRoles() ?? Enumerable.Empty<string>();
    }
}
