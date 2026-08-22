using Asp.Versioning;
using EnglishLearningPlatform.Application.DTOs.Story;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EnglishLearningPlatform.API.Extensions;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/stories")]
    public class StoriesController : ControllerBase
    {
        private readonly IStoryService _storyService;
        private readonly ICacheService _cacheService;

        private const string CacheKeyPrefix = "stories:";

        public StoriesController(IStoryService storyService, ICacheService cacheService)
        {
            _storyService = storyService;
            _cacheService = cacheService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] StoryQueryParameters parameters, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(parameters.Search))
            {
                var cacheKey = $"{CacheKeyPrefix}list:{parameters.PageNumber}:{parameters.PageSize}:{parameters.StoryCategoryId}:{parameters.StoryLevelId}:{parameters.IsPublished}:{parameters.SortBy}:{parameters.Descending}";

                var cached = await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    async ct => await _storyService.GetAllAsync(parameters, ct),
                    TimeSpan.FromMinutes(2),
                    cancellationToken);

                return Ok(cached);
            }

            var result = await _storyService.GetAllAsync(parameters, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            // Only apply daily read limit for non-admin authenticated users
            if (userId.HasValue && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            {
                var accessResult = await _storyService.EnsureDailyReadAccessAsync(userId.Value, id, cancellationToken);
                if (!accessResult.IsSuccess)
                    return StatusCode(StatusCodes.Status403Forbidden, accessResult);
            }

            var cacheKey = $"{CacheKeyPrefix}detail:{id}";

            var result = await _cacheService.GetOrCreateAsync(
                cacheKey,
                async ct => await _storyService.GetByIdAsync(id, ct),
                TimeSpan.FromMinutes(5),
                cancellationToken);

            if (!result.IsSuccess)
                return NotFound(result);

            return Ok(result);
        }

        private async Task InvalidateCachesAsync(CancellationToken cancellationToken)
        {
            await _cacheService.RemoveByPrefixAsync(CacheKeyPrefix, cancellationToken);
            await _cacheService.RemoveByPrefixAsync("story-categories:", cancellationToken);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Create(CreateStoryDto dto, CancellationToken cancellationToken)
        {
            var result = await _storyService.CreateAsync(dto, cancellationToken);
            if (!result.IsSuccess)
                return BadRequest(result);

            await InvalidateCachesAsync(cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id, version = "1.0" }, result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Update(Guid id, UpdateStoryDto dto, CancellationToken cancellationToken)
        {
            var result = await _storyService.UpdateAsync(id, dto, cancellationToken);
            if (!result.IsSuccess)
                return NotFound(result);

            await InvalidateCachesAsync(cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:guid}/publish")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Publish(Guid id, [FromQuery] bool publish, CancellationToken cancellationToken)
        {
            var result = await _storyService.PublishAsync(id, publish, cancellationToken);
            if (!result.IsSuccess)
                return NotFound(result);

            await InvalidateCachesAsync(cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _storyService.DeleteAsync(id, cancellationToken);
            if (!result.IsSuccess)
                return NotFound(result);

            await InvalidateCachesAsync(cancellationToken);
            return Ok(result);
        }
    }
}