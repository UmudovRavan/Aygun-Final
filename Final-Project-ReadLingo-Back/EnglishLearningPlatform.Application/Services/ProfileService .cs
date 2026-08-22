using AutoMapper;
using EnglishLearningPlatform.Application.DTOs.Profile;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{

    public class ProfileService : IProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProfileService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<ProfileDto>> GetAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result<ProfileDto>.Failure("Profile not found.");

            var dto = _mapper.Map<ProfileDto>(user);

            dto.DaysStreak = user.CurrentStreak;
            dto.LongestStreak = user.LongestStreak;
            dto.TotalXp = user.TotalXp;
            dto.Hearts = user.Hearts;
            dto.IsAnonymousInLeaderboard = user.IsAnonymousInLeaderboard;
            dto.Plan = user.CurrentTier.ToString().ToLowerInvariant();

            var progresses = await _unitOfWork.UserProgresses.GetByUserIdAsync(userId, cancellationToken);
            dto.StoriesCompleted = progresses
                .Where(p => p.IsCompleted)
                .Select(p => p.StoryId)
                .Distinct()
                .Count();

            var attempts = await _unitOfWork.QuizAttempts.GetByUserIdAsync(userId, cancellationToken);
            var completedAttempts = attempts.Where(a => a.CompletedAt != null).ToList();
            var totalCorrect = completedAttempts.Sum(a => a.CorrectAnswers);
            var totalAnswered = completedAttempts.Sum(a => a.CorrectAnswers + a.IncorrectAnswers);

            dto.AccuracyPercentage = totalAnswered > 0
                ? Math.Round(totalCorrect / (double)totalAnswered * 100, 1)
                : 0;

            return Result<ProfileDto>.Success(dto);
        }

        public async Task<Result<ProfileDto>> UpdateAsync(
            Guid userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result<ProfileDto>.Failure("Profile not found.");

            var existingProfilePicture = user.ProfilePictureUrl;

            _mapper.Map(dto, user);

            if (dto.ProfilePictureUrl == null)
            {
                user.ProfilePictureUrl = existingProfilePicture;
            }

            if (dto.Hearts.HasValue)
            {
                user.Hearts = dto.Hearts.Value;
            }

            if (dto.IsAnonymousInLeaderboard.HasValue)
            {
                user.IsAnonymousInLeaderboard = dto.IsAnonymousInLeaderboard.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.Plan) && Enum.TryParse<Domain.Enums.SubscriptionTier>(dto.Plan, true, out var parsedTier))
            {
                user.CurrentTier = parsedTier;
                if (parsedTier != Domain.Enums.SubscriptionTier.Free)
                {
                    user.Hearts = 9999;
                }
                else
                {
                    user.Hearts = 5;
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.UserName))
            {
                user.UserName = dto.UserName.Trim();
                user.NormalizedUserName = dto.UserName.Trim().ToUpperInvariant();
            }
            user.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<ProfileDto>.Success(_mapper.Map<ProfileDto>(user), "Profile updated.");
        }

        public async Task<Result> DeleteAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
            if (user is null)
                return Result.Failure("Profile not found.");

           
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success("Account deactivated.");
        }
    }

}
