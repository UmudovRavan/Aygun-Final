using EnglishLearningPlatform.Application.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EnglishLearningPlatform.API.Filters
{

    public class ValidationFilter : IAsyncActionFilter
    {
        private readonly IServiceProvider _serviceProvider;

        public ValidationFilter(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var errors = new List<string>();

            foreach (var argument in context.ActionArguments.Values)
            {
                if (argument is null)
                    continue;

                var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
                if (_serviceProvider.GetService(validatorType) is not IValidator validator)
                    continue;

                var validationContext = new ValidationContext<object>(argument);
                var validationResult = await validator.ValidateAsync(validationContext);

                if (!validationResult.IsValid)
                    errors.AddRange(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            if (errors.Count > 0)
            {
                context.Result = new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(
                    Result.Failure(string.Join("; ", errors))
                );
                return;
            }

            await next();
        }
    }
}
