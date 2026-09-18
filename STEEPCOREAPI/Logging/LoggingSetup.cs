namespace STEEPCOREAPI.Logging;

public static class LoggingSetup
{
    public static IServiceCollection AddCustomLogging(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        services.AddLogging(builder =>
        {
            builder.ClearProviders();
            builder.AddConsole();

            if (environment.IsDevelopment())
            {
                builder.AddDebug();
                builder.SetMinimumLevel(LogLevel.Debug);
            }
            else
            {
                builder.SetMinimumLevel(LogLevel.Information);
            }

            var logLevel = configuration.GetSection("Logging:LogLevel:Default").Value;
            if (Enum.TryParse<LogLevel>(logLevel, out var level))
            {
                builder.SetMinimumLevel(level);
            }
        });

        return services;
    }
}

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = context.TraceIdentifier;
        var method = context.Request.Method;
        var path = context.Request.Path;
        var queryString = context.Request.QueryString;

        _logger.LogInformation("Request started: {RequestId} {Method} {Path}{QueryString}",
            requestId, method, path, queryString);

        var startTime = DateTime.UtcNow;

        try
        {
            await _next(context);
            var elapsed = DateTime.UtcNow - startTime;

            if (elapsed.TotalSeconds > 5)
            {
                _logger.LogWarning("Slow request detected: {RequestId} {Method} {Path} took {ElapsedMs}ms ({StatusCode})",
                    requestId, method, path, elapsed.TotalMilliseconds, context.Response.StatusCode);
            }
            else
            {
                _logger.LogInformation("Request completed: {RequestId} {StatusCode} ({ElapsedMs}ms)",
                    requestId, context.Response.StatusCode, elapsed.TotalMilliseconds);
            }
        }
        catch (Exception ex)
        {
            var elapsed = DateTime.UtcNow - startTime;
            _logger.LogError(ex, "Request failed: {RequestId} {Method} {Path} ({ElapsedMs}ms)",
                requestId, method, path, elapsed.TotalMilliseconds);
            throw;
        }
    }
}
