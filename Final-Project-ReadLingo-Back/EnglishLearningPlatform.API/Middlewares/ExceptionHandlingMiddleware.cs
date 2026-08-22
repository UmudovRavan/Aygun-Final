using EnglishLearningPlatform.Application.Exceptions;
using EnglishLearningPlatform.Application.Responses;
using System.Net;
using System.Text.Json;

namespace EnglishLearningPlatform.API.Middlewares
{

    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public ExceptionHandlingMiddleware(
            RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var (statusCode, result) = exception switch
            {
                NotFoundException ex => (HttpStatusCode.NotFound, Result.Failure(ex.Message)),
                ValidationAppException ex => (HttpStatusCode.BadRequest,
                    Result.Failure(string.Join("; ", ex.Errors.SelectMany(e => e.Value)))),
                ForbiddenAccessException ex => (HttpStatusCode.Forbidden, Result.Failure(ex.Message)),
                ConflictException ex => (HttpStatusCode.Conflict, Result.Failure(ex.Message)),
                FileUploadException ex => (HttpStatusCode.BadRequest, Result.Failure(ex.Message)),
                RateLimitException ex => (HttpStatusCode.TooManyRequests, Result.Failure(ex.Message)),
                UnauthorizedAccessException ex => (HttpStatusCode.Unauthorized, Result.Failure(ex.Message)),
                _ => (HttpStatusCode.InternalServerError, Result.Failure(
                    _environment.IsDevelopment() ? exception.ToString() : "An unexpected error occurred.")),
            };

            if (statusCode == HttpStatusCode.InternalServerError)
                _logger.LogError(exception, "Unhandled exception on {Path}", context.Request.Path);
            else
                _logger.LogWarning(exception, "Handled exception ({StatusCode}) on {Path}", statusCode, context.Request.Path);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var json = JsonSerializer.Serialize(result, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });

            await context.Response.WriteAsync(json);
        }
    }

}
