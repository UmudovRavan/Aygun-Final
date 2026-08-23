using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/ai")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAIStoryGeneratorService _storyGeneratorService;
        private readonly IAIQuizGeneratorService _quizGeneratorService;
        private readonly IStandaloneQuizGeneratorService _standaloneQuizGeneratorService;

        public AiController(
            IAIStoryGeneratorService storyGeneratorService,
            IAIQuizGeneratorService quizGeneratorService,
            IStandaloneQuizGeneratorService standaloneQuizGeneratorService)
        {
            _storyGeneratorService = storyGeneratorService;
            _quizGeneratorService = quizGeneratorService;
            _standaloneQuizGeneratorService = standaloneQuizGeneratorService;
        }

        private Guid CurrentUserId => User.GetUserId()!.Value;

        [HttpPost("generate-story")]
        public async Task<IActionResult> GenerateStory(GenerateStoryRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _storyGeneratorService.GenerateAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("generate-quiz")]
        public async Task<IActionResult> GenerateQuiz(GenerateQuizForChapterDto dto, CancellationToken cancellationToken)
        {
            var result = await _quizGeneratorService.GenerateForChapterAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("generate-quiz-standalone")]
        public async Task<IActionResult> GenerateStandaloneQuiz(
            GenerateStandaloneQuizRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _standaloneQuizGeneratorService.GenerateAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}