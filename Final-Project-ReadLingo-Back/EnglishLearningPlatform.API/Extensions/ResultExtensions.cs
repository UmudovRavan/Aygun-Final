using EnglishLearningPlatform.Application.Responses;
using Microsoft.AspNetCore.Mvc;

namespace EnglishLearningPlatform.API.Extensions
{
    public static class ResultExtensions
    {
        public static IActionResult ToActionResult(this Result result) =>
            result.IsSuccess ? new OkObjectResult(result) : MapFailure(result);

        public static IActionResult ToActionResult<T>(this Result<T> result) =>
            result.IsSuccess ? new OkObjectResult(result) : MapFailure(result);

        public static IActionResult ToCreatedResult<T>(this Result<T> result, string actionName, object routeValues, ControllerBase controller) =>
            result.IsSuccess
                ? controller.CreatedAtAction(actionName, routeValues, result)
                : MapFailure(result);

        public static IActionResult ToNoContentResult(this Result result) =>
            result.IsSuccess ? new NoContentResult() : MapFailure(result);

        private static IActionResult MapFailure(Result result)
        {
            var error = result.Error;

            if (error.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return new NotFoundObjectResult(result);

            return new BadRequestObjectResult(result);
        }
    }
}
