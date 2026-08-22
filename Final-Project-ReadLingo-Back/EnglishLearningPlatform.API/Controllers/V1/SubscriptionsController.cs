using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{

    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/subscriptions")]
    [Authorize]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _service;

        public SubscriptionsController(ISubscriptionService service)
        {
            _service = service;
        }

        private Guid CurrentUserId => User.GetUserId()!.Value;

        [HttpGet("active")]
        public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
        {
            var result = await _service.GetActiveAsync(CurrentUserId, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory(CancellationToken cancellationToken)
        {
            var result = await _service.GetHistoryAsync(CurrentUserId, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Subscribe(CreateSubscriptionDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.SubscribeAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.CancelAsync(CurrentUserId, id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }
    }
}
