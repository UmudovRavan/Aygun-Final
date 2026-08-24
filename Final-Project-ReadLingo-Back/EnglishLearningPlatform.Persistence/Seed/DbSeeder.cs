using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Seed
{

    public static class DbSeeder
    {
        private static readonly string[] Roles = { "Admin", "Moderator", "User" };

        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DbSeeder));

            try
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await context.Database.MigrateAsync();

                try
                {
                    await context.Database.ExecuteSqlRawAsync("IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='StoryCategories' AND COLUMN_NAME='IconUrl') ALTER TABLE [StoryCategories] ALTER COLUMN [IconUrl] nvarchar(max) NULL;");
                    await context.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='DailyGoalMinutes') ALTER TABLE [AspNetUsers] ADD [DailyGoalMinutes] int NOT NULL DEFAULT 15;");
                }
                catch (Exception sqlEx)
                {
                    logger.LogWarning(sqlEx, "Notice: could not run direct alter column on DB entities");
                }

                await SeedRolesAsync(scope.ServiceProvider);
                await SeedAdminUserAsync(scope.ServiceProvider);
                await SeedStoryLevelsAsync(context);
                await SeedStoryCategoriesAsync(context);

                logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private static async Task SeedRolesAsync(IServiceProvider provider)
        {
            var roleManager = provider.GetRequiredService<RoleManager<AppRole>>();

            foreach (var roleName in Roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new AppRole { Name = roleName, Description = $"{roleName} role" });
                }
            }
        }

        private static async Task SeedAdminUserAsync(IServiceProvider provider)
        {
            var userManager = provider.GetRequiredService<UserManager<AppUser>>();

            const string adminEmail = "admin@lingo.app";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser is null)
            {
                adminUser = new AppUser
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FirstName = "Lingo",
                    LastName = "Admin",
                    EmailConfirmed = true,
                    IsActive = true,
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@12345");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
            else
            {
                if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }

        private static async Task SeedStoryLevelsAsync(ApplicationDbContext context)
        {
            var defaultLevels = new List<StoryLevel>
            {
                new StoryLevel { Name = "Beginner", Rank = StoryLevelRank.Beginner, Order = 1, Description = "New learners, simple vocabulary (A1)." },
                new StoryLevel { Name = "Elementary", Rank = StoryLevelRank.Elementary, Order = 2, Description = "Basic sentence structures (A2)." },
                new StoryLevel { Name = "Intermediate", Rank = StoryLevelRank.Intermediate, Order = 3, Description = "Everyday conversational language (B1)." },
                new StoryLevel { Name = "Upper Intermediate", Rank = StoryLevelRank.UpperIntermediate, Order = 4, Description = "Complex grammar and idioms (B2)." },
                new StoryLevel { Name = "Advanced", Rank = StoryLevelRank.Advanced, Order = 5, Description = "Near-native fluency material (C1)." },
                new StoryLevel { Name = "Proficient", Rank = StoryLevelRank.Proficient, Order = 6, Description = "Mastery and native-level fluency material (C2)." },
            };

            foreach (var level in defaultLevels)
            {
                if (!await context.StoryLevels.AnyAsync(l => l.Name == level.Name || l.Rank == level.Rank))
                {
                    context.StoryLevels.Add(level);
                }
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedStoryCategoriesAsync(ApplicationDbContext context)
        {
            if (await context.StoryCategories.AnyAsync())
                return;

            context.StoryCategories.AddRange(
                new StoryCategory { Name = "Business", Description = "Workplace and professional communication.", IconUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80" },
                new StoryCategory { Name = "Daily Life", Description = "Everyday situations and routines.", IconUrl = "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80" },
                new StoryCategory { Name = "Fiction", Description = "Short stories and folk tales.", IconUrl = "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80" },
                new StoryCategory { Name = "Horror", Description = "Spooky mysteries and dark thrillers.", IconUrl = "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80" },
                new StoryCategory { Name = "Travel", Description = "Airports, hotels, and getting around.", IconUrl = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80" },
                new StoryCategory { Name = "Culture", Description = "Traditions, history, and customs.", IconUrl = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80" });

            await context.SaveChangesAsync();
        }
    }
}
