using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/leaderboard")]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardService _service;

        public LeaderboardController(ILeaderboardService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeaderboard([FromQuery] string category = "xp", CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            var result = await _service.GetLeaderboardAsync(category, userId, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("privacy")]
        [Authorize]
        public async Task<IActionResult> TogglePrivacy([FromQuery] bool isAnonymous, CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _service.TogglePrivacyAsync(userId.Value, isAnonymous, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}
