using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IQuizService
    {
        Task<Result<IReadOnlyList<QuizDto>>> GetByChapterIdAsync(Guid chapterId, CancellationToken cancellationToken = default);
        Task<Result<QuizDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<QuizDto>> CreateAsync(CreateQuizDto dto, CancellationToken cancellationToken = default);
        Task<Result<QuizDto>> UpdateAsync(Guid id, UpdateQuizDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<QuizResultDto>> SubmitAsync(Guid quizId, Guid userId, QuizSubmissionDto dto, CancellationToken cancellationToken = default);
        Task<Result<QuizDto>> GenerateForChapterAsync(Guid userId, Guid chapterId, CancellationToken cancellationToken = default);

        Task<Result<QuizAttemptDto>> SubmitAttemptAsync(Guid userId, Guid quizAttemptId, QuizSubmissionDto dto, CancellationToken cancellationToken = default);

        Task<Result<HeartStatusDto>> GetHeartStatusAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result> RecordQuizResultAsync(Guid userId, RecordQuizResultDto dto, CancellationToken cancellationToken = default);
    }
}
