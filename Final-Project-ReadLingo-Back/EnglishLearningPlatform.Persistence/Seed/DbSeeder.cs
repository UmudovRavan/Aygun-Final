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
            if (await context.StoryLevels.AnyAsync())
                return;

            context.StoryLevels.AddRange(
                new StoryLevel { Name = "Beginner", Rank = StoryLevelRank.Beginner, Order = 1, Description = "New learners, simple vocabulary." },
                new StoryLevel { Name = "Elementary", Rank = StoryLevelRank.Elementary, Order = 2, Description = "Basic sentence structures." },
                new StoryLevel { Name = "Intermediate", Rank = StoryLevelRank.Intermediate, Order = 3, Description = "Everyday conversational language." },
                new StoryLevel { Name = "Upper Intermediate", Rank = StoryLevelRank.UpperIntermediate, Order = 4, Description = "Complex grammar and idioms." },
                new StoryLevel { Name = "Advanced", Rank = StoryLevelRank.Advanced, Order = 5, Description = "Near-native fluency material." });

            await context.SaveChangesAsync();
        }

        private static async Task SeedStoryCategoriesAsync(ApplicationDbContext context)
        {
            if (await context.StoryCategories.AnyAsync())
                return;

            context.StoryCategories.AddRange(
                new StoryCategory { Name = "Daily Life", Description = "Everyday situations and routines." },
                new StoryCategory { Name = "Travel", Description = "Airports, hotels, and getting around." },
                new StoryCategory { Name = "Business", Description = "Workplace and professional communication." },
                new StoryCategory { Name = "Culture", Description = "Traditions, history, and customs." },
                new StoryCategory { Name = "Fiction", Description = "Short stories and folk tales." });

            await context.SaveChangesAsync();
        }
    }
}
