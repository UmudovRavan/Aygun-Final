using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningPlatform.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizAndChatFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Flashcards_AppUserId_VocabularyId",
                table: "Flashcards");

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "UserProgresses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TimeLimitSeconds",
                table: "Questions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "VocabularyId",
                table: "Flashcards",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "Flashcards",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IncorrectCount",
                table: "Flashcards",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "WordTranslationId",
                table: "Flashcards",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConsecutiveCorrectAnswers",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Hearts",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastHeartLostAt",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalXp",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ChatConversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatConversations_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuizId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "int", nullable: false),
                    IncorrectAnswers = table.Column<int>(type: "int", nullable: false),
                    XpEarned = table.Column<int>(type: "int", nullable: false),
                    RemainingHearts = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Chapters_ChapterId",
                        column: x => x.ChapterId,
                        principalTable: "Chapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Stories_StoryId",
                        column: x => x.StoryId,
                        principalTable: "Stories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WordTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Lemma = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TargetLanguage = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Translation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PartOfSpeech = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordTranslations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AIResponse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChatMessages_ChatConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "ChatConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WordInteractions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VocabularyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    InteractionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WordTranslationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChapterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordInteractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WordInteractions_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WordInteractions_Chapters_ChapterId",
                        column: x => x.ChapterId,
                        principalTable: "Chapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WordInteractions_Vocabularies_VocabularyId",
                        column: x => x.VocabularyId,
                        principalTable: "Vocabularies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_WordInteractions_WordTranslations_WordTranslationId",
                        column: x => x.WordTranslationId,
                        principalTable: "WordTranslations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Flashcards_AppUserId_VocabularyId",
                table: "Flashcards",
                columns: new[] { "AppUserId", "VocabularyId" },
                unique: true,
                filter: "[VocabularyId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Flashcards_AppUserId_WordTranslationId",
                table: "Flashcards",
                columns: new[] { "AppUserId", "WordTranslationId" },
                unique: true,
                filter: "[WordTranslationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Flashcards_WordTranslationId",
                table: "Flashcards",
                column: "WordTranslationId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatConversations_AppUserId",
                table: "ChatConversations",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_AppUserId",
                table: "ChatMessages",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId_CreatedAt",
                table: "ChatMessages",
                columns: new[] { "ConversationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_AppUserId_ChapterId_CompletedAt",
                table: "QuizAttempts",
                columns: new[] { "AppUserId", "ChapterId", "CompletedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_ChapterId",
                table: "QuizAttempts",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_QuizId",
                table: "QuizAttempts",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_StoryId",
                table: "QuizAttempts",
                column: "StoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WordInteractions_AppUserId_VocabularyId",
                table: "WordInteractions",
                columns: new[] { "AppUserId", "VocabularyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WordInteractions_AppUserId_WordTranslationId",
                table: "WordInteractions",
                columns: new[] { "AppUserId", "WordTranslationId" });

            migrationBuilder.CreateIndex(
                name: "IX_WordInteractions_ChapterId",
                table: "WordInteractions",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_WordInteractions_VocabularyId",
                table: "WordInteractions",
                column: "VocabularyId");

            migrationBuilder.CreateIndex(
                name: "IX_WordInteractions_WordTranslationId",
                table: "WordInteractions",
                column: "WordTranslationId");

            migrationBuilder.CreateIndex(
                name: "IX_WordTranslations_Lemma_TargetLanguage",
                table: "WordTranslations",
                columns: new[] { "Lemma", "TargetLanguage" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Flashcards_WordTranslations_WordTranslationId",
                table: "Flashcards",
                column: "WordTranslationId",
                principalTable: "WordTranslations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Flashcards_WordTranslations_WordTranslationId",
                table: "Flashcards");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "QuizAttempts");

            migrationBuilder.DropTable(
                name: "WordInteractions");

            migrationBuilder.DropTable(
                name: "ChatConversations");

            migrationBuilder.DropTable(
                name: "WordTranslations");

            migrationBuilder.DropIndex(
                name: "IX_Flashcards_AppUserId_VocabularyId",
                table: "Flashcards");

            migrationBuilder.DropIndex(
                name: "IX_Flashcards_AppUserId_WordTranslationId",
                table: "Flashcards");

            migrationBuilder.DropIndex(
                name: "IX_Flashcards_WordTranslationId",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "UserProgresses");

            migrationBuilder.DropColumn(
                name: "TimeLimitSeconds",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "IncorrectCount",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "WordTranslationId",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "ConsecutiveCorrectAnswers",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Hearts",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastHeartLostAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TotalXp",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<Guid>(
                name: "VocabularyId",
                table: "Flashcards",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Flashcards_AppUserId_VocabularyId",
                table: "Flashcards",
                columns: new[] { "AppUserId", "VocabularyId" },
                unique: true);
        }
    }
}
