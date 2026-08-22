using EnglishLearningPlatform.API.Extensions;
using EnglishLearningPlatform.Application;
using EnglishLearningPlatform.Infrastructure;
using EnglishLearningPlatform.Persistence;
using EnglishLearningPlatform.Persistence.Seed;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/lingo-.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14);
    });

    builder.Services.AddApplication(builder.Configuration);
    builder.Services.AddPersistence(builder.Configuration);
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApiServices(builder.Configuration);

    var app = builder.Build();

    await DbSeeder.SeedAsync(app.Services);

    app.UseApiPipeline();

    app.Run();
}
catch (HostAbortedException)
{

    throw;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Lingo API terminated unexpectedly during startup.");
}
finally
{
    Log.CloseAndFlush();
}