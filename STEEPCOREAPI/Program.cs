using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using STEEPCOREAPI.Middleware;
using STEEPCOREAPI.Modules.AiEngine.Services;
using STEEPCOREAPI.Modules.Blueprints.Services;
using STEEPCOREAPI.Modules.Marketplace.Services;
using STEEPCOREAPI.Shared.Database;
using STEEPCOREAPI.Shared.Interfaces;
using STEEPCOREAPI.Shared.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Load environment-specific settings
if (!builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Production.json", optional: true, reloadOnChange: false);
}

// Render Port Binding
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://*:{port}");
}

#region Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
if (builder.Environment.IsDevelopment())
{
    builder.Logging.AddDebug();
    builder.Logging.SetMinimumLevel(LogLevel.Debug);
}
else
{
    builder.Logging.SetMinimumLevel(LogLevel.Warning);
}
#endregion

#region Configuration
var isProduction = builder.Environment.IsProduction();
var jwtSecret = configuration["Jwt:Secret"] ?? configuration["JWT_SECRET"] ??
    throw new InvalidOperationException("JWT secret is not configured. Ensure 'JWT_SECRET' exists in appsettings or environment variables.");

if (isProduction && (jwtSecret.Length < 32 || jwtSecret.Contains("change-this")))
    throw new InvalidOperationException("JWT secret is not properly configured for production. Use a secure key of at least 32 characters.");

var jwtIssuer = configuration["Jwt:Issuer"] ?? configuration["JWT_ISSUER"] ?? (isProduction ?
    throw new InvalidOperationException("JWT Issuer is required in production") :
    "https://localhost");

var jwtAudience = configuration["Jwt:Audience"] ?? configuration["JWT_AUDIENCE"] ?? "SteepCoreAPI";

// Validate production-specific settings
if (isProduction)
{
    var geminiKey = configuration["AiEngine:Gemini:ApiKey"] ?? configuration["GEMINI_API_KEY"];
    if (string.IsNullOrWhiteSpace(geminiKey) || geminiKey.Contains("your-google"))
        throw new InvalidOperationException("Gemini API key is not configured for production.");

    var stripeKey = configuration["Stripe:SecretKey"] ?? configuration["STRIPE_SECRET_KEY"];
    if (string.IsNullOrWhiteSpace(stripeKey))
        throw new InvalidOperationException("Stripe Secret Key must be configured in production.");

    var connectionString = configuration.GetConnectionString("DefaultConnection") ?? configuration["DB_CONNECTION_STRING"];
  
}
#endregion

#region Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection") ?? configuration["DB_CONNECTION_STRING"]
        ?? throw new InvalidOperationException("DefaultConnection is not configured. Add 'DB_CONNECTION_STRING' as an environment variable in Render.");

    options.UseNpgsql(connectionString, npgsqlOptions => npgsqlOptions.UseVector());
});
#endregion

#region Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
#endregion

#region Authentication & Authorization
var key = Encoding.UTF8.GetBytes(jwtSecret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = isProduction;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // Hybrid extraction: Checks HttpOnly cookie first, falls back to Authorization header
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // 1. Check browser cookie (used by web apps)
            context.Token = context.Request.Cookies["access_token"];

            // 2. Fall back to Authorization Bearer header if cookie is empty (used by mobile apps, Postman, or Swagger)
            if (string.IsNullOrEmpty(context.Token))
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    context.Token = authHeader["Bearer ".Length..].Trim();
                }
            }

            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorization();
#endregion

#region Service Registration
builder.Services.AddScoped<IBlueprintService, BlueprintService>();
builder.Services.AddScoped<IAiService, GeminiAiService>();
builder.Services.AddScoped<IPaymentService, StripePaymentService>();
builder.Services.AddScoped<IEmbeddingService, GeminiEmbeddingService>();

builder.Services.AddHttpClient<GeminiAiService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "SteepCoreAPI/1.0");
    client.Timeout = TimeSpan.FromSeconds(60);
});

builder.Services.AddHttpClient<GeminiEmbeddingService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "SteepCoreAPI/1.0");
    client.Timeout = TimeSpan.FromSeconds(60);
});

builder.Services.AddHttpClient<StripePaymentService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "SteepCoreAPI/1.0");
    client.Timeout = TimeSpan.FromSeconds(30);
});
#endregion

#region API Configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// UPDATED CORS POLICY: Allow AI Studio and any other frontend origin to connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", corsPolicyBuilder =>
    {
        corsPolicyBuilder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
#endregion

var app = builder.Build();

#region Database Initialization
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInit");
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        await dbContext.Database.MigrateAsync();
        logger.LogInformation("Database migrations applied successfully.");

        if (app.Environment.IsDevelopment())
        {
            await DbSeeder.InitializeAsync(dbContext, userManager, logger);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying migrations or seeding database.");
    }
}
#endregion

#region Middleware Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable Swagger if in Development OR if explicitly enabled in Render's Environment Variables
var enableSwagger = app.Environment.IsDevelopment() ||
                    builder.Configuration.GetValue<bool>("ENABLE_SWAGGER");
if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Steepcore API v1");
        c.RoutePrefix = "swagger"; // Available at /swagger
    });
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Log slow HTTP requests in production (> 1 second)
if (app.Environment.IsProduction())
{
    app.Use(async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("RequestMonitoring");
        var startTime = DateTime.UtcNow;

        await next();

        var elapsed = DateTime.UtcNow - startTime;
        if (elapsed.TotalSeconds > 1)
        {
            logger.LogWarning("Slow request: {Method} {Path} took {ElapsedMs}ms with status {StatusCode}",
                context.Request.Method, context.Request.Path, elapsed.TotalMilliseconds, context.Response.StatusCode);
        }
    });
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Error handling endpoint
app.MapGet("/error", (HttpContext context, ILoggerFactory loggerFactory) =>
{
    var logger = loggerFactory.CreateLogger("ErrorHandler");
    var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
    var exception = exceptionHandlerPathFeature?.Error;

    if (exception != null)
    {
        logger.LogError(exception, "Unhandled exception routed to /error endpoint");
    }

    return Results.Problem(
        detail: app.Environment.IsDevelopment() ? exception?.Message : "An internal error occurred.",
        statusCode: 500
    );
})
.WithName("Error")
.AllowAnonymous();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}))
.WithName("Health")
.AllowAnonymous();

app.MapGet("/health/ready", async (HttpContext context, ILoggerFactory loggerFactory) =>
{
    try
    {
        var dbContext = context.RequestServices.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.CanConnectAsync();
        return Results.Ok(new { status = "ready", timestamp = DateTime.UtcNow });
    }
    catch (Exception ex)
    {
        var logger = loggerFactory.CreateLogger("HealthCheck");
        logger.LogError(ex, "Readiness health check failed");
        return Results.StatusCode(503);
    }
})
.WithName("Readiness")
.AllowAnonymous();
#endregion

// Run application
app.Logger.LogInformation("Starting SteepCoreAPI in {Environment} environment", app.Environment.EnvironmentName);
app.Run();

public partial class Program { }
