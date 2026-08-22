using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IStandaloneQuizGeneratorService
    {
        Task<Result<GeneratedStandaloneQuizDto>> GenerateAsync(
            Guid userId, GenerateStandaloneQuizRequestDto dto, CancellationToken cancellationToken = default);
    }
}
