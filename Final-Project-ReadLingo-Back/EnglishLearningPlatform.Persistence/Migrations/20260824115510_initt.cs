using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class initt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='DailyGoalMinutes')
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [DailyGoalMinutes] int NOT NULL DEFAULT 15;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyGoalMinutes",
                table: "AspNetUsers");
        }
    }
}
