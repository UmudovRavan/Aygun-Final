using Asp.Versioning;
using EnglishLearningPlatform.Application.DTOs.Chapter;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Progress;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/chapters")]
    public class ChaptersController : ControllerBase
    {
        private readonly IChapterService _service;
        private readonly IProgressService _progressService;
        private readonly IQuizService _quizService;
        private readonly ICacheService _cacheService;

        public ChaptersController(
            IChapterService service,
            IProgressService progressService,
            IQuizService quizService,
            ICacheService cacheService)
        {
            _service = service;
            _progressService = progressService;
            _quizService = quizService;
            _cacheService = cacheService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetByStory([FromQuery] Guid storyId, CancellationToken cancellationToken)
        {
            var result = await _service.GetByStoryIdAsync(storyId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId.HasValue)
            {
                var accessResult = await _service.EnsureCanAccessChapterAsync(userId.Value, id, cancellationToken);
                if (!accessResult.IsSuccess)
                    return StatusCode(StatusCodes.Status403Forbidden, accessResult);
            }

            var result = await _service.GetByIdAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Create(CreateChapterDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.CreateAsync(dto, cancellationToken);
            if (!result.IsSuccess)
                return BadRequest(result);

            await _cacheService.RemoveByPrefixAsync("stories:", cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id, version = "1.0" }, result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Update(Guid id, UpdateChapterDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.UpdateAsync(id, dto, cancellationToken);
            if (!result.IsSuccess)
                return NotFound(result);

            await _cacheService.RemoveByPrefixAsync("stories:", cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(id, cancellationToken);
            if (!result.IsSuccess)
                return NotFound(result);

            await _cacheService.RemoveByPrefixAsync("stories:", cancellationToken);
            return Ok(result);
        }

        [HttpPost("{id:guid}/complete")]
        [Authorize]
        public async Task<IActionResult> CompleteChapter(Guid id, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var chapterResult = await _service.GetByIdAsync(id, cancellationToken);
            if (!chapterResult.IsSuccess)
                return NotFound(chapterResult);

            await _progressService.RecordReadingAsync(userId.Value, new RecordReadingDto
            {
                StoryId = chapterResult.Value!.StoryId,
                ChapterId = id,
                ReadingPositionPercentage = 100,
            }, cancellationToken);

            var quizResult = await _quizService.GenerateForChapterAsync(
                userId.Value,
                id,
                cancellationToken);

            return quizResult.IsSuccess
                ? Ok(quizResult)
                : BadRequest(quizResult);
        }

        [HttpGet("{id:guid}/read-aloud")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReadAloud(
            Guid id, [FromQuery] string? voiceId, [FromQuery] string? languageCode, CancellationToken cancellationToken)
        {
            var result = await _service.GetReadAloudAsync(id, voiceId, languageCode, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }
    }
}