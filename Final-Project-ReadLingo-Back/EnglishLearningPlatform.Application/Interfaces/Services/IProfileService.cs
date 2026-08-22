using EnglishLearningPlatform.Application.DTOs.Profile;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IProfileService
    {
        Task<Result<ProfileDto>> GetAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Result<ProfileDto>> UpdateAsync(Guid userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
        Task<Result> DeleteAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
