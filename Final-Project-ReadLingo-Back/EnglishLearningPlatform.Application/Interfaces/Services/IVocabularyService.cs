using EnglishLearningPlatform.Application.DTOs.Vocabulary;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IVocabularyService
    {
        Task<Result<IReadOnlyList<VocabularyDto>>> GetAllAsync(Guid? userId, Guid? chapterId = null, CancellationToken cancellationToken = default);
        Task<Result<IReadOnlyList<VocabularyDto>>> GetByChapterIdAsync(Guid chapterId, CancellationToken cancellationToken = default);
        Task<Result<VocabularyDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<VocabularyDto>> CreateAsync(CreateVocabularyDto dto, CancellationToken cancellationToken = default);
        Task<Result<VocabularyDto>> UpdateAsync(Guid id, UpdateVocabularyDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result> RecordInteractionAsync(Guid userId, CreateWordInteractionDto dto, CancellationToken cancellationToken = default);
        Task<Result<FlashcardPopupDto>> GetNextFlashcardAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
