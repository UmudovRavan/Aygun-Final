using Asp.Versioning;
using EnglishLearningPlatform.Application.DTOs.Admin;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _service;

        public AdminController(IUserService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] AdminUserQueryParameters parameters, CancellationToken cancellationToken)
        {
            var result = await _service.GetAllAsync(parameters, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetByIdAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateUserStatusDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.UpdateStatusAsync(id, dto.IsActive, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpPost("{id:guid}/roles")]
        public async Task<IActionResult> AssignRole(Guid id, AssignRoleDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.AssignRoleAsync(id, dto.Role, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id:guid}/roles")]
        public async Task<IActionResult> RemoveRole(Guid id, AssignRoleDto dto, CancellationToken cancellationToken)
        {
            var result = await _service.RemoveRoleAsync(id, dto.Role, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(id, cancellationToken);
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        [HttpGet("/api/v{version:apiVersion}/admin/dashboard")]
        public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
        {
            var result = await _service.GetDashboardStatsAsync(cancellationToken);
            return Ok(result);
        }
    }
}
