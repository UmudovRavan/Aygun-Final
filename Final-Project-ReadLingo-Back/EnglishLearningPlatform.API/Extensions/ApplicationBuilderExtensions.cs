using EnglishLearningPlatform.API.Middlewares;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace EnglishLearningPlatform.API.Extensions
{

    public static class ApplicationBuilderExtensions
    {
        public static WebApplication UseApiPipeline(this WebApplication app)
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();
            app.UseMiddleware<RequestLoggingMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    foreach (var description in app.DescribeApiVersions())
                    {
                        options.SwaggerEndpoint(
                            $"/swagger/{description.GroupName}/swagger.json",
                            $"Lingo API {description.GroupName.ToUpperInvariant()}");
                    }
                });
            }
            else
            {
                app.UseHttpsRedirection();
            }

            app.UseCors("LingoCorsPolicy");

            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseStaticFiles(); 

            app.MapControllers();

            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
            });

            app.MapHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("ready"),
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
            });

            app.MapHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false, 
            });

            return app;
        }

        private static IReadOnlyList<Asp.Versioning.ApiExplorer.ApiVersionDescription> DescribeApiVersions(this WebApplication app)
        {
            var provider = app.Services.GetRequiredService<Asp.Versioning.ApiExplorer.IApiVersionDescriptionProvider>();
            return provider.ApiVersionDescriptions;
        }
    }

}
