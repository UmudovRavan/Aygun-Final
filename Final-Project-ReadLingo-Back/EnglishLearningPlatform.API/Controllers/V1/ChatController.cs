using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Chat;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        private Guid CurrentUserId => User.GetUserId()!.Value;

     
        [HttpPost("messages")]
        [AllowAnonymous]
        public async Task<IActionResult> SendMessage(ChatRequestDto dto, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            var result = await _chatService.SendMessageAsync(userId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations(CancellationToken cancellationToken)
        {
            var result = await _chatService.GetConversationsAsync(CurrentUserId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("conversations/{conversationId:guid}/messages")]
        public async Task<IActionResult> GetMessages(
            Guid conversationId, [FromQuery] int limit, CancellationToken cancellationToken)
        {
            var effectiveLimit = limit > 0 ? limit : 20;
            var result = await _chatService.GetMessagesAsync(CurrentUserId, conversationId, effectiveLimit, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpGet("usage")]
        public async Task<IActionResult> GetUsage(CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
            {
                return Ok(new
                {
                    IsSuccess = true,
                    Data = new ChatUsageDto
                    {
                        Tier = "Free",
                        UsedToday = 0,
                        DailyLimit = 5,
                        IsUnlimited = false,
                        Remaining = 5
                    }
                });
            }

            var result = await _chatService.GetUsageAsync(userId.Value, cancellationToken);
            return Ok(result);
        }
    }
}
