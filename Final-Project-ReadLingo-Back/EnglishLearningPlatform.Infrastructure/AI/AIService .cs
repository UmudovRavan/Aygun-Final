using AutoMapper;
using EnglishLearningPlatform.Application.DTOs;
using EnglishLearningPlatform.Application.DTOs.AI;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.AI
{
    public class AIService : IAIService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderClient _providerClient;
        private readonly IMapper _mapper;

        public AIService(IUnitOfWork unitOfWork, IAIProviderClient providerClient, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _providerClient = providerClient;
            _mapper = mapper;
        }

        public async Task<Result<AIHistoryDto>> AskAsync(
            Guid userId, AIRequestDto dto, CancellationToken cancellationToken = default)
        {
            var response = await _providerClient.CompleteAsync(dto.FeatureType, dto.Prompt, cancellationToken);

            var history = new AIHistory
            {
                AppUserId = userId,
                FeatureType = dto.FeatureType,
                Prompt = dto.Prompt,
                Response = response,
            };

            await _unitOfWork.AIHistories.AddAsync(history, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<AIHistoryDto>.Success(_mapper.Map<AIHistoryDto>(history));
        }

        public async Task<Result<IReadOnlyList<AIHistoryDto>>> GetHistoryAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.AIHistories.GetByUserIdAsync(userId, cancellationToken);
            return Result<IReadOnlyList<AIHistoryDto>>.Success(_mapper.Map<IReadOnlyList<AIHistoryDto>>(items));
        }
    }
}
