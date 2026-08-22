using Asp.Versioning;
using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.API.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly ISubscriptionPaymentService _subscriptionPaymentService;

        public PaymentsController(ISubscriptionPaymentService subscriptionPaymentService)
        {
            _subscriptionPaymentService = subscriptionPaymentService;
        }

        private Guid CurrentUserId => User.GetUserId()!.Value;

        [HttpPost("checkout")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _subscriptionPaymentService.CreateCheckoutSessionAsync(CurrentUserId, dto, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelSubscription(CancellationToken cancellationToken)
        {
            var result = await _subscriptionPaymentService.CancelSubscriptionAsync(CurrentUserId, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentSubscription(CancellationToken cancellationToken)
        {
            var result = await _subscriptionPaymentService.GetCurrentSubscriptionAsync(CurrentUserId, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifySession([FromQuery] string sessionId, CancellationToken cancellationToken)
        {
            var result = await _subscriptionPaymentService.VerifySessionAsync(CurrentUserId, sessionId, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook()
        {
            string json;
            using (var reader = new StreamReader(Request.Body))
            {
                json = await reader.ReadToEndAsync();
            }

            var signatureHeader = Request.Headers["Stripe-Signature"].ToString();

            if (string.IsNullOrEmpty(signatureHeader))
            {
                return BadRequest("Missing Stripe-Signature header.");
            }

            var result = await _subscriptionPaymentService.HandleWebhookEventAsync(json, signatureHeader);
            return result.IsSuccess ? Ok() : BadRequest(result.Message);
        }
    }
}
