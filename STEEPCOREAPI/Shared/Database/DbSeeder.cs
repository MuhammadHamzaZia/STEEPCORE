using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Shared.Database;

public class DbSeeder
{
    public static async Task InitializeAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, ILogger logger)
    {
        try
        {
            await context.Database.EnsureCreatedAsync();

            var usersCount = await context.Users.CountAsync();
            if (usersCount > 0)
            {
                logger.LogInformation("Database already seeded. Skipping seed operation.");
                return;
            }

            logger.LogInformation("Seeding database with initial data...");

            await SeedUsersAsync(userManager, logger);
            await SeedBlueprintsAsync(context, logger);

            logger.LogInformation("Database seeded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding database");
            throw;
        }
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager, ILogger logger)
    {
        var adminUser = new ApplicationUser
        {
            UserName = "admin@steepcore.com",
            Email = "admin@steepcore.com",
            EmailConfirmed = true,
            FullName = "Admin User"
        };

        var result = await userManager.CreateAsync(adminUser, "Admin@123456");
        if (result.Succeeded)
            logger.LogInformation("Admin user created successfully");
        else
            logger.LogWarning("Admin user already exists or creation failed");

        var demoUser = new ApplicationUser
        {
            UserName = "demo@steepcore.com",
            Email = "demo@steepcore.com",
            EmailConfirmed = true,
            FullName = "Demo User"
        };

        result = await userManager.CreateAsync(demoUser, "Demo@123456");
        if (result.Succeeded)
            logger.LogInformation("Demo user created successfully");
        else
            logger.LogWarning("Demo user already exists or creation failed");
    }

    private static async Task SeedBlueprintsAsync(ApplicationDbContext context, ILogger logger)
    {
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@steepcore.com");
        if (adminUser == null)
            return;

        var blueprintCount = await context.Blueprints.CountAsync();
        if (blueprintCount > 0)
        {
            logger.LogInformation("Blueprints already exist. Skipping blueprint seeding.");
            return;
        }

        var blueprints = new List<Blueprint>
        {
            new Blueprint
            {
                Id = Guid.NewGuid(),
                Title = "Learn React.js",
                Description = "Master React and become a frontend developer",
                Domain = "Web Development",
                Price = 29.99m,
                IsPublished = true,
                CreatedByUserId = adminUser.Id,
                ViewCount = 150,
                PurchaseCount = 25,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow
            },
            new Blueprint
            {
                Id = Guid.NewGuid(),
                Title = "Python for Data Science",
                Description = "Learn Python and data analysis tools",
                Domain = "Data Science",
                Price = 39.99m,
                IsPublished = true,
                CreatedByUserId = adminUser.Id,
                ViewCount = 200,
                PurchaseCount = 45,
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                UpdatedAt = DateTime.UtcNow
            },
            new Blueprint
            {
                Id = Guid.NewGuid(),
                Title = "AWS Cloud Mastery",
                Description = "Complete AWS certification training",
                Domain = "Cloud Computing",
                Price = 49.99m,
                IsPublished = true,
                CreatedByUserId = adminUser.Id,
                ViewCount = 300,
                PurchaseCount = 75,
                CreatedAt = DateTime.UtcNow.AddDays(-90),
                UpdatedAt = DateTime.UtcNow
            },
            new Blueprint
            {
                Id = Guid.NewGuid(),
                Title = "Docker & Kubernetes",
                Description = "Containerization and orchestration",
                Domain = "DevOps",
                Price = 44.99m,
                IsPublished = true,
                CreatedByUserId = adminUser.Id,
                ViewCount = 250,
                PurchaseCount = 60,
                CreatedAt = DateTime.UtcNow.AddDays(-45),
                UpdatedAt = DateTime.UtcNow
            }
        };

        await context.Blueprints.AddRangeAsync(blueprints);
        await context.SaveChangesAsync();

        logger.LogInformation($"Seeded {blueprints.Count} blueprints");
    }
}
