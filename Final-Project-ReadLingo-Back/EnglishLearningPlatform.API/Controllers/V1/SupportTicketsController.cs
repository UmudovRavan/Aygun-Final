using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Common;
using EnglishLearningPlatform.Application.DTOs.Support;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/support-tickets")]
    [Authorize]
    public class SupportTicketsController : ControllerBase
    {
        private readonly ISupportService _service;

        public SupportTicketsController(ISupportService service)
        {
            _service = service;
        }

        private Guid CurrentUserId => User.GetUserId()!.Value;

        [HttpGet("mine")]
        public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
        {
            var result = await _service.GetByUserIdAsync(CurrentUserId, cancellationToken);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters, CancellationToken cancellationToken)
        {
            var result = await _service.GetAllAsync(parameters, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetByIdAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create(CreateSupportTicketDto dto, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId() ?? Guid.Empty;
            var result = await _service.CreateAsync(userId, dto, cancellationToken);
            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> Update(Guid id, UpdateSupportTicketDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.UpdateAsync(id, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }
    }
}
