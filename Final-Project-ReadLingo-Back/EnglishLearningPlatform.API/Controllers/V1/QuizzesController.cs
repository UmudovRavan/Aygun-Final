using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Responses;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/quizzes")]
    [Authorize]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizService _service;
        private readonly IProgressService _progressService;
        private readonly IUnitOfWork _unitOfWork;

        public QuizzesController(IQuizService service, IProgressService progressService, IUnitOfWork unitOfWork)
        {
            _service = service;
            _progressService = progressService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet("story/{storyId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByStory(Guid storyId, [FromQuery] Guid? chapterId, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId() ?? Guid.Empty;
            Guid targetChapterId;
            if (chapterId.HasValue && chapterId.Value != Guid.Empty)
            {
                targetChapterId = chapterId.Value;
            }
            else
            {
                var chapters = await _unitOfWork.Chapters.GetByStoryIdAsync(storyId, cancellationToken);
                var first = chapters.FirstOrDefault();
                if (first == null) return NotFound(Result.Failure("No chapters found for story."));
                targetChapterId = first.Id;
            }

            var result = await _service.GenerateForChapterAsync(userId, targetChapterId, cancellationToken);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromQuery] Guid chapterId, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _service.GenerateForChapterAsync(userId.Value, chapterId, cancellationToken);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetByChapter([FromQuery] Guid chapterId, CancellationToken cancellationToken)
        {
            var result = await _service.GetByChapterIdAsync(chapterId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetByIdAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Create(CreateQuizDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.CreateAsync(dto, cancellationToken);
            if (!result.IsSuccess)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id, version = "1.0" }, result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Update(Guid id, UpdateQuizDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.UpdateAsync(id, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPost("{id:guid}/submit")]
        public async Task<IActionResult> Submit(Guid id, QuizSubmissionDto dto, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _service.SubmitAsync(id, userId.Value, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("heart-status")]
        public async Task<IActionResult> GetHeartStatus(CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _service.GetHeartStatusAsync(userId.Value, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

     
        [HttpPost("attempts/{attemptId:guid}/submit")]
        public async Task<IActionResult> SubmitAttempt(Guid attemptId, QuizSubmissionDto dto, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _service.SubmitAttemptAsync(userId.Value, attemptId, dto, cancellationToken);

            if (result.IsSuccess && result.Value!.CorrectAnswers >= 3)
                await _progressService.RecordDailyActivityAsync(userId.Value, cancellationToken);

            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("record-result")]
        public async Task<IActionResult> RecordResult(RecordQuizResultDto dto, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _service.RecordQuizResultAsync(userId.Value, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}