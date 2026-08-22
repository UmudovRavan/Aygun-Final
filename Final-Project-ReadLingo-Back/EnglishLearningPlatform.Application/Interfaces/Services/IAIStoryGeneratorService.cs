using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IAIStoryGeneratorService
    {
        Task<Result<GeneratedStoryDto>> GenerateAsync(
            Guid userId, GenerateStoryRequestDto dto, CancellationToken cancellationToken = default);
    }
}
