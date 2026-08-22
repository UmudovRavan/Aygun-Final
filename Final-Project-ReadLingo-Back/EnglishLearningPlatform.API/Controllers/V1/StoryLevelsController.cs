using Asp.Versioning;
using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.DTOs.StoryLevel;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/story-levels")]
    public class StoryLevelsController : ControllerBase
    {
        private readonly IStoryLevelService _service;
        private readonly ICacheService _cacheService;
        private const string CacheKeyPrefix = "story-levels:";

        public StoryLevelsController(IStoryLevelService service, ICacheService cacheService)
        {
            _service = service;
            _cacheService = cacheService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters, CancellationToken cancellationToken)
        {
            var cacheKey = $"{CacheKeyPrefix}{parameters.PageNumber}:{parameters.PageSize}:{parameters.Search}:{parameters.Descending}";
            var result = await _cacheService.GetOrCreateAsync(
                cacheKey, ct => _service.GetAllAsync(parameters, ct), TimeSpan.FromMinutes(10), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetByIdAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateStoryLevelDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.CreateAsync(dto, cancellationToken);
            if (!result.IsSuccess)
                return BadRequest(result);

            await _cacheService.RemoveByPrefixAsync(CacheKeyPrefix, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id, version = "1.0" }, result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateStoryLevelDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.UpdateAsync(id, dto, cancellationToken);
            if (!result.IsSuccess)
                return NotFound(result);

            await _cacheService.RemoveByPrefixAsync(CacheKeyPrefix, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(id, cancellationToken);
            if (!result.IsSuccess)
                return BadRequest(result);

            await _cacheService.RemoveByPrefixAsync(CacheKeyPrefix, cancellationToken);
            return Ok(result);
        }
    }
}
