using EnglishLearningPlatform.Application.DTOs.Chapter;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IChapterService
    {
        Task<Result<IReadOnlyList<ChapterDto>>> GetByStoryIdAsync(Guid storyId, CancellationToken cancellationToken = default);
        Task<Result<ChapterDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<ChapterDto>> CreateAsync(CreateChapterDto dto, CancellationToken cancellationToken = default);
        Task<Result<ChapterDto>> UpdateAsync(Guid id, UpdateChapterDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Result<ReadAloudDto>> GetReadAloudAsync(
        Guid chapterId, string? voiceId = null, string? languageCode = null, CancellationToken cancellationToken = default);
        Task<Result> EnsureCanAccessChapterAsync(Guid userId, Guid chapterId, CancellationToken cancellationToken = default);
    }
}
