using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IJwtTokenService
    {
        string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);

        TimeSpan AccessTokenLifetime { get; }

        TimeSpan RefreshTokenLifetime { get; }
    }
}
