using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.DTOs.Quiz;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IAIQuizGeneratorService
    {
        Task<Result<QuizDto>> GenerateForChapterAsync(
            Guid userId, GenerateQuizForChapterDto dto, CancellationToken cancellationToken = default);
    }
}
