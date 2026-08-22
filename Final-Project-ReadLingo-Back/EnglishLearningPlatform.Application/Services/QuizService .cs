using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.DTOs.Translation;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class QuizService : IQuizService
    {
        private const int MaxHearts = 5;
        private const int HeartRegenMinutes = 30;
        private const int XpPerCorrectAnswer = 10;
        private const int DefaultTimeLimitSeconds = 15;

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ITranslationService _translationService;
        private readonly IAIProviderClient _aiProviderClient;

        public QuizService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ITranslationService translationService,
            IAIProviderClient aiProviderClient)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _translationService = translationService;
            _aiProviderClient = aiProviderClient;
        }

        public async Task<Result<IReadOnlyList<QuizDto>>> GetByChapterIdAsync(
            Guid chapterId, CancellationToken cancellationToken = default)
        {
            var quizzes = await _unitOfWork.Quizzes.GetByChapterIdAsync(chapterId, cancellationToken);
            return Result<IReadOnlyList<QuizDto>>.Success(_mapper.Map<IReadOnlyList<QuizDto>>(quizzes));
        }

        public async Task<Result<QuizDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Quizzes.GetWithQuestionsAndAnswersAsync(id, cancellationToken);
            if (entity is null)
                return Result<QuizDto>.Failure("Quiz not found.");

            return Result<QuizDto>.Success(_mapper.Map<QuizDto>(entity));
        }

        public async Task<Result<QuizDto>> CreateAsync(CreateQuizDto dto, CancellationToken cancellationToken = default)
        {
            if (!await _unitOfWork.Chapters.AnyAsync(c => c.Id == dto.ChapterId, cancellationToken))
                return Result<QuizDto>.Failure("Chapter not found.");

            var entity = _mapper.Map<Quiz>(dto);
            await _unitOfWork.Quizzes.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var created = await _unitOfWork.Quizzes.GetWithQuestionsAndAnswersAsync(entity.Id, cancellationToken);
            return Result<QuizDto>.Success(_mapper.Map<QuizDto>(created), "Quiz created.");
        }

        public async Task<Result<QuizDto>> UpdateAsync(
            Guid id, UpdateQuizDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Quizzes.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result<QuizDto>.Failure("Quiz not found.");

            _mapper.Map(dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Quizzes.Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var updated = await _unitOfWork.Quizzes.GetWithQuestionsAndAnswersAsync(id, cancellationToken);
            return Result<QuizDto>.Success(_mapper.Map<QuizDto>(updated), "Quiz updated.");
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Quizzes.GetByIdAsync(id, cancellationToken);
            if (entity is null)
                return Result.Failure("Quiz not found.");

            _unitOfWork.Quizzes.Remove(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Quiz deleted.");
        }

        public async Task<Result<QuizResultDto>> SubmitAsync(
            Guid quizId, Guid userId, QuizSubmissionDto dto, CancellationToken cancellationToken = default)
        {
            var quiz = await _unitOfWork.Quizzes.GetWithQuestionsAndAnswersAsync(quizId, cancellationToken);
            if (quiz is null)
                return Result<QuizResultDto>.Failure("Quiz not found.");

            var totalQuestions = quiz.Questions.Count;
            if (totalQuestions == 0)
                return Result<QuizResultDto>.Failure("This quiz has no questions.");

            var correct = 0;
            foreach (var submitted in dto.Answers)
            {
                var question = quiz.Questions.FirstOrDefault(q => q.Id == submitted.QuestionId);
                var selectedAnswer = question?.Answers.FirstOrDefault(a => a.Id == submitted.SelectedAnswerId);
                if (selectedAnswer is { IsCorrect: true })
                    correct++;
            }

            var scorePercentage = Math.Round(correct / (double)totalQuestions * 100, 2);

            var result = new QuizResultDto
            {
                QuizId = quizId,
                TotalQuestions = totalQuestions,
                CorrectAnswers = correct,
                ScorePercentage = scorePercentage,
                Passed = scorePercentage >= quiz.PassingScore,
            };

            var chapter = await _unitOfWork.Chapters.GetByIdAsync(quiz.ChapterId, cancellationToken);
            if (chapter != null)
            {
                var progress = await _unitOfWork.UserProgresses.GetByUserAndStoryAsync(userId, chapter.StoryId, cancellationToken);
                if (progress is null)
                {
                    progress = new UserProgress
                    {
                        AppUserId = userId,
                        StoryId = chapter.StoryId,
                        ChapterId = chapter.Id,
                        ProgressPercentage = result.Passed ? 100 : 0,
                        IsCompleted = result.Passed,
                        CompletedAt = result.Passed ? DateTime.UtcNow : null,
                    };
                    await _unitOfWork.UserProgresses.AddAsync(progress, cancellationToken);
                }
                else if (result.Passed && !progress.IsCompleted)
                {
                    progress.IsCompleted = true;
                    progress.ProgressPercentage = 100;
                    progress.CompletedAt = DateTime.UtcNow;
                    _unitOfWork.UserProgresses.Update(progress);
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return Result<QuizResultDto>.Success(result);
        }


        public async Task<Result<QuizDto>> GenerateForChapterAsync(
            Guid userId, Guid chapterId, CancellationToken cancellationToken = default)
        {
            var chapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId, cancellationToken);
            if (chapter is null)
                return Result<QuizDto>.Failure("Chapter not found.");

            int userHearts = MaxHearts;
            Guid? attemptId = null;

            if (userId != Guid.Empty)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
                if (user != null)
                {
                    await RegenerateHeartsAsync(user, cancellationToken);
                    userHearts = user.Hearts;

                    var attempt = new QuizAttempt
                    {
                        AppUserId = userId,
                        StoryId = chapter.StoryId,
                        ChapterId = chapterId,
                        QuizId = null,
                        StartedAt = DateTime.UtcNow,
                        RemainingHearts = user.Hearts,
                    };
                    await _unitOfWork.QuizAttempts.AddAsync(attempt, cancellationToken);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    attemptId = attempt.Id;
                }
            }

            var questionDtos = await BuildBilingualVocabularyQuestionsAsync(userId, chapterId, cancellationToken);
            if (questionDtos.Count == 0)
                return Result<QuizDto>.Failure("This chapter has no vocabulary content available yet.");

            var quizDto = new QuizDto
            {
                Id = Guid.Empty,
                ChapterId = chapterId,
                QuizAttemptId = attemptId ?? Guid.Empty,
                Title = "Chapter Vocabulary Quiz",
                Questions = questionDtos,
            };

            return Result<QuizDto>.Success(quizDto);
        }

        public async Task<Result<QuizAttemptDto>> SubmitAttemptAsync(
            Guid userId, Guid quizAttemptId, QuizSubmissionDto dto, CancellationToken cancellationToken = default)
        {
            var attempt = await _unitOfWork.QuizAttempts.GetByIdAsync(quizAttemptId, cancellationToken);
            if (attempt is null || attempt.AppUserId != userId)
                return Result<QuizAttemptDto>.Failure("Quiz attempt not found.");

            if (attempt.CompletedAt != null)
                return Result<QuizAttemptDto>.Failure("This quiz attempt has already been submitted.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result<QuizAttemptDto>.Failure("User not found.");

            await RegenerateHeartsAsync(user, cancellationToken);

            var currentTier = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            var isUnlimitedHearts = currentTier != null && currentTier.Tier != SubscriptionTier.Free;

            var correct = 0;
            var incorrect = 0;
            var questionResults = new List<QuestionResultDto>();

            foreach (var submitted in dto.Answers)
            {
                var timedOut = submitted.SelectedAnswerId is null;
                var isCorrect = !timedOut && submitted.SelectedAnswerId == submitted.QuestionId;

                var correctTranslation = await _unitOfWork.WordTranslations.GetByIdAsync(submitted.QuestionId, cancellationToken);

                if (isCorrect)
                {
                    correct++;

                    var earnedHeart = await IncrementStoryCorrectCounterAsync(userId, attempt.StoryId, cancellationToken);
                    if (earnedHeart && user.Hearts < MaxHearts)
                    {
                        user.Hearts = Math.Min(MaxHearts, user.Hearts + 1);
                        _unitOfWork.Users.Update(user);
                    }
                }
                else
                {
                    incorrect++;
                    
                    if (!isUnlimitedHearts)
                        await LoseHeartAsync(user, cancellationToken);
                }

                await UpdateWordMasteryAsync(userId, submitted.QuestionId, isCorrect, cancellationToken);

                questionResults.Add(new QuestionResultDto
                {
                    QuestionId = submitted.QuestionId,
                    WasCorrect = isCorrect,
                    TimedOut = timedOut,
                    CorrectAnswerId = submitted.QuestionId,
                    CorrectAnswerText = correctTranslation?.Translation ?? string.Empty,
                });
            }

            var xpEarned = correct * XpPerCorrectAnswer;
            user.TotalXp += xpEarned;

            attempt.CompletedAt = DateTime.UtcNow;
            attempt.DurationSeconds = (int)(attempt.CompletedAt.Value - attempt.StartedAt).TotalSeconds;
            attempt.CorrectAnswers = correct;
            attempt.IncorrectAnswers = incorrect;
            attempt.XpEarned = xpEarned;
            attempt.RemainingHearts = user.Hearts;

            _unitOfWork.Users.Update(user);
            _unitOfWork.QuizAttempts.Update(attempt);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var canProceed = isUnlimitedHearts || user.Hearts > 0;

            var resultDto = _mapper.Map<QuizAttemptDto>(attempt);
            resultDto.CanProceedToNextChapter = canProceed;
            resultDto.QuestionResults = questionResults;

            var message = canProceed
                ? "Quiz submitted."
                : "Out of hearts. Wait for a heart to recover or upgrade to Pro/Premium for unlimited hearts.";

            return Result<QuizAttemptDto>.Success(resultDto, message);
        }

        public async Task<Result<HeartStatusDto>> GetHeartStatusAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result<HeartStatusDto>.Failure("User not found.");

            await RegenerateHeartsAsync(user, cancellationToken);

            var subscription = await _unitOfWork.Subscriptions.GetActiveByUserIdAsync(userId, cancellationToken);
            var isUnlimited = subscription != null && subscription.Tier != SubscriptionTier.Free;

            var pendingTimers = await _unitOfWork.HeartRecoveryTimers.GetPendingByUserIdAsync(userId, cancellationToken);

            var dto = new HeartStatusDto
            {
                Hearts = user.Hearts,
                MaxHearts = MaxHearts,
                IsUnlimited = isUnlimited,
                PendingRecoveryTimes = pendingTimers.Select(t => t.RecoverAt).ToList(),
            };

            return Result<HeartStatusDto>.Success(dto);
        }


        private async Task RegenerateHeartsAsync(AppUser user, CancellationToken cancellationToken)
        {
            if (user.Hearts >= MaxHearts)
                return;

            var pendingTimers = await _unitOfWork.HeartRecoveryTimers.GetPendingByUserIdAsync(user.Id, cancellationToken);
            var now = DateTime.UtcNow;
            var recovered = 0;

            foreach (var timer in pendingTimers)
            {
                if (timer.RecoverAt > now)
                    continue; 

                timer.IsRecovered = true;
                _unitOfWork.HeartRecoveryTimers.Update(timer);
                recovered++;
            }

            if (recovered > 0)
            {
                user.Hearts = Math.Min(MaxHearts, user.Hearts + recovered);
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        private async Task LoseHeartAsync(AppUser user, CancellationToken cancellationToken)
        {
            if (user.Hearts <= 0)
                return;

            user.Hearts--;
            _unitOfWork.Users.Update(user);

            var now = DateTime.UtcNow;
            await _unitOfWork.HeartRecoveryTimers.AddAsync(new HeartRecoveryTimer
            {
                AppUserId = user.Id,
                LostAt = now,
                RecoverAt = now.AddMinutes(HeartRegenMinutes),
            }, cancellationToken);
        }

        private async Task<bool> IncrementStoryCorrectCounterAsync(
            Guid userId, Guid storyId, CancellationToken cancellationToken)
        {
            var counter = await _unitOfWork.RemainingCorrectCounters.GetByUserAndStoryAsync(userId, storyId, cancellationToken);
            if (counter is null)
            {
                counter = new RemainingCorrectCounter { AppUserId = userId, StoryId = storyId, Count = 0 };
                await _unitOfWork.RemainingCorrectCounters.AddAsync(counter, cancellationToken);
            }

            counter.Count++;

            if (counter.Count >= 3)
            {
                counter.Count -= 3;
                _unitOfWork.RemainingCorrectCounters.Update(counter);
                return true;
            }

            _unitOfWork.RemainingCorrectCounters.Update(counter);
            return false;
        }

        private async Task UpdateWordMasteryAsync(
            Guid userId, Guid wordTranslationId, bool wasCorrect, CancellationToken cancellationToken)
        {
            var flashcards = await _unitOfWork.Flashcards.GetByUserIdAsync(userId, cancellationToken);
            var flashcard = flashcards.FirstOrDefault(f => f.WordTranslationId == wordTranslationId);

            if (flashcard is null)
            {
                flashcard = new Flashcard
                {
                    AppUserId = userId,
                    WordTranslationId = wordTranslationId,
                };
                await _unitOfWork.Flashcards.AddAsync(flashcard, cancellationToken);
            }

            if (wasCorrect)
                flashcard.CorrectCount++;
            else
                flashcard.IncorrectCount++;

            flashcard.ReviewCount++;

            flashcard.Status = flashcard.CorrectCount - flashcard.IncorrectCount >= 3
                ? FlashcardStatus.Mastered
                : flashcard.IncorrectCount > flashcard.CorrectCount
                    ? FlashcardStatus.Learning
                    : FlashcardStatus.Reviewing;

            flashcard.NextReviewDate = flashcard.Status == FlashcardStatus.Mastered
                ? DateTime.UtcNow.AddDays(7)
                : DateTime.UtcNow.AddDays(1);

            _unitOfWork.Flashcards.Update(flashcard);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<List<QuestionDto>> BuildBilingualVocabularyQuestionsAsync(
            Guid userId, Guid chapterId, CancellationToken cancellationToken)
        {
            var chapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId, cancellationToken);
            if (chapter == null) return new List<QuestionDto>();

            var story = await _unitOfWork.Stories.GetByIdAsync(chapter.StoryId, cancellationToken);
            var storyTitle = story?.Title ?? chapter.Title;

            var prompt = $$"""
            You are an expert English language teacher and exam author.
            Create 4 engaging, high-quality multiple-choice quiz questions based on the following story chapter for English learners.

            STORY TITLE: {{storyTitle}}
            CHAPTER TITLE: {{chapter.Title}}
            CONTENT:
            \"\"\"
            {{chapter.Content}}
            \"\"\"

            REQUIREMENTS:
            1. Generate 2 Reading Comprehension questions assessing understanding of the story events, character motivations, or key facts.
            2. Generate 2 Contextual Vocabulary questions testing words or expressions used in this chapter.
            3. Each question must have EXACTLY 4 distinct, plausible options (A, B, C, D).
            4. "correctAnswer" must match exactly one of the 4 strings in "options".
            5. "explanation" must be a concise sentence (in English) explaining why this answer is correct based on the story.
            6. Respond ONLY as a JSON array of objects with NO markdown formatting, matching this schema:
            [
              {
                "question": "What did the character do after discovering the key?",
                "options": ["He opened the chest", "He gave it away", "He threw it into the lake", "He hid it under his bed"],
                "correctAnswer": "He opened the chest",
                "explanation": "The story mentions that he immediately unlocked the wooden chest."
              }
            ]
            """;

            List<AiGeneratedQuizQuestionItem>? parsed = null;
            try
            {
                var aiResponse = await _aiProviderClient.CompleteAsync(AIFeatureType.QuizGeneration, prompt, cancellationToken);
                var cleanedJson = EnglishLearningPlatform.Application.Common.JsonCleaner.Clean(aiResponse);
                parsed = System.Text.Json.JsonSerializer.Deserialize<List<AiGeneratedQuizQuestionItem>>(
                    cleanedJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AI Quiz Generation error: {ex.Message}");
            }

            var questions = new List<QuestionDto>();
            var random = Random.Shared;

            if (parsed != null && parsed.Count > 0)
            {
                var order = 1;
                foreach (var item in parsed)
                {
                    if (string.IsNullOrWhiteSpace(item.Question) || item.Options == null || item.Options.Count < 2)
                        continue;

                    var correct = item.CorrectAnswer?.Trim() ?? item.Options[0].Trim();
                    var optionsList = item.Options.Select(o => o.Trim()).Distinct().ToList();
                    if (!optionsList.Any(o => string.Equals(o, correct, StringComparison.OrdinalIgnoreCase)))
                    {
                        optionsList.Insert(0, correct);
                    }
                    while (optionsList.Count < 4)
                    {
                        optionsList.Add($"Another event in the story ({optionsList.Count + 1})");
                    }
                    if (optionsList.Count > 4)
                    {
                        optionsList = optionsList.Take(4).ToList();
                        if (!optionsList.Any(o => string.Equals(o, correct, StringComparison.OrdinalIgnoreCase)))
                        {
                            optionsList[0] = correct;
                        }
                    }

                    // Shuffle options randomly
                    var shuffledOptions = optionsList.OrderBy(_ => random.Next()).ToList();
                    var answers = shuffledOptions.Select((opt, idx) => new AnswerDto
                    {
                        Id = Guid.NewGuid(),
                        Text = opt,
                        Order = idx,
                        IsCorrect = string.Equals(opt, correct, StringComparison.OrdinalIgnoreCase)
                    }).ToList();

                    questions.Add(new QuestionDto
                    {
                        Id = Guid.NewGuid(),
                        Text = item.Question,
                        QuestionType = QuestionType.MultipleChoice,
                        Category = QuestionCategory.ReadingComprehension,
                        Order = order++,
                        TimeLimitSeconds = DefaultTimeLimitSeconds,
                        CorrectAnswer = correct,
                        Explanation = item.Explanation,
                        Answers = answers,
                    });
                }
            }

            // Fallback if AI was unavailable
            if (questions.Count == 0)
            {
                questions = GenerateFallbackQuestions(chapter);
            }

            return questions;
        }

        private List<QuestionDto> GenerateFallbackQuestions(Chapter chapter)
        {
            var questions = new List<QuestionDto>();
            var random = Random.Shared;

            questions.Add(new QuestionDto
            {
                Id = Guid.NewGuid(),
                Text = $"What is the main focus of '{chapter.Title}'?",
                QuestionType = QuestionType.MultipleChoice,
                Category = QuestionCategory.ReadingComprehension,
                Order = 1,
                TimeLimitSeconds = DefaultTimeLimitSeconds,
                CorrectAnswer = $"The events in {chapter.Title}",
                Explanation = "The chapter describes these key events.",
                Answers = new List<string> { $"The events in {chapter.Title}", "An unrelated cookbook recipe", "A technical instruction manual", "A math test" }
                    .OrderBy(_ => random.Next())
                    .Select((opt, idx) => new AnswerDto
                    {
                        Id = Guid.NewGuid(),
                        Text = opt,
                        Order = idx,
                        IsCorrect = opt.StartsWith("The events in")
                    }).ToList()
            });

            return questions;
        }

        private record AiGeneratedQuizQuestionItem(
            string Question,
            List<string> Options,
            string CorrectAnswer,
            string? Explanation
        );

        public async Task<Result> RecordQuizResultAsync(
            Guid userId, RecordQuizResultDto dto, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result.Failure("User not found.");

            var attempt = new Domain.Entities.QuizAttempt
            {
                AppUserId = userId,
                StoryId = dto.StoryId,
                ChapterId = dto.ChapterId ?? Guid.Empty,
                CorrectAnswers = dto.CorrectAnswers,
                IncorrectAnswers = dto.IncorrectAnswers,
                XpEarned = dto.XpEarned,
                RemainingHearts = dto.RemainingHearts,
                StartedAt = DateTime.UtcNow.AddMinutes(-2),
                CompletedAt = DateTime.UtcNow,
            };

            await _unitOfWork.QuizAttempts.AddAsync(attempt, cancellationToken);

            user.TotalXp += dto.XpEarned;
            user.Hearts = Math.Max(0, dto.RemainingHearts);
            user.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success("Quiz result recorded successfully.");
        }
    }
}