using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Favorite;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{

    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/favorites")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _service;

        public FavoritesController(IFavoriteService service)
        {
            _service = service;
        }

        private Guid CurrentUserId => User.GetUserId()!.Value;

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _service.GetByUserIdAsync(CurrentUserId, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Add(CreateFavoriteStoryDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.AddAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{storyId:guid}")]
        public async Task<IActionResult> Remove(Guid storyId, CancellationToken cancellationToken)
        {
            var result = await _service.RemoveAsync(CurrentUserId, storyId, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }
    }
}
