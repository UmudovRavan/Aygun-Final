using EnglishLearningPlatform.Application.DTOs.Translation;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface ITranslationService
    {
        Task<Result<TranslateWordResponseDto>> TranslateAsync(
            TranslateWordRequestDto dto, CancellationToken cancellationToken = default);
    }
}
