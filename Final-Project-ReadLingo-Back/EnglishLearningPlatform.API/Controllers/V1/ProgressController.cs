using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Progress;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/progress")]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _service;

        public ProgressController(IProgressService service)
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
        public async Task<IActionResult> Upsert(UpsertUserProgressDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.UpsertAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("reading-history")]
        public async Task<IActionResult> GetReadingHistory(CancellationToken cancellationToken)
        {
            var result = await _service.GetReadingHistoryAsync(CurrentUserId, cancellationToken);
            return Ok(result);
        }

        [HttpPost("reading-history")]
        public async Task<IActionResult> RecordReading(RecordReadingDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.RecordReadingAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("streak")]
        public async Task<IActionResult> GetStreak(CancellationToken cancellationToken)
        {
            var result = await _service.RecordDailyActivityAsync(CurrentUserId, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}