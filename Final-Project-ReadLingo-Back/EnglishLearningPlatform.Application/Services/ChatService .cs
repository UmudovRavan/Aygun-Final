using EnglishLearningPlatform.Application.DTOs.Chat;
using EnglishLearningPlatform.Application.Interfaces.Repositories;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Application.Responses;
using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Services
{
    public class ChatService : IChatService
    {
        private const int DefaultHistoryLimit = 10;

        private const string SystemPrompt =
            "You are Lingo, the expert and friendly AI English Tutor for the ReadLingo platform.\n\n" +
            "CORE LANGUAGE & TEACHING RULES (MANDATORY):\n" +
            "1. STORY GENERATION (CRITICAL):\n" +
            "   - When a user asks you to write, generate, or tell a story (even if asked in Azerbaijani, Russian, or any other language), the STORY CONTENT ITSELF MUST ALWAYS BE WRITTEN IN ENGLISH.\n" +
            "   - Format the response as follows:\n" +
            "     📖 **Story Title (in English)**\n" +
            "     [The complete story written in clear English tailored to learners]\n\n" +
            "     🔑 **Key Vocabulary & Translations / Açar Sözlər**:\n" +
            "     - List 4-6 important words from the story with their English definitions and translations in the user's language.\n" +
            "     💡 **Mini-Quiz or Question** (optional short comprehension question in English).\n\n" +
            "2. WORD MEANING & VOCABULARY:\n" +
            "   - When asked about a word or idiom, explain its definition and nuances in the user's language (e.g. Azerbaijani).\n" +
            "   - Provide 2-3 natural EXAMPLE SENTENCES in English with their translations in the user's language.\n" +
            "   - Mention synonyms, pronunciation (if useful), and common collocations.\n\n" +
            "3. GRAMMAR EXPLANATIONS:\n" +
            "   - Explain the grammar concept in the user's language.\n" +
            "   - Always provide clear ENGLISH sample sentences showing the correct usage (and contrasting with common mistakes).\n\n" +
            "4. TONE & FORMATTING:\n" +
            "   - Friendly, encouraging, and pedagogically clear.\n" +
            "   - Use clean Markdown (bold titles, bullet points, emojis) to make reading pleasant and structured.";

        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIProviderClient _aiProviderClient;
        private readonly ISubscriptionAccessService _subscriptionAccessService;

        public ChatService(
            IUnitOfWork unitOfWork,
            IAIProviderClient aiProviderClient,
            ISubscriptionAccessService subscriptionAccessService)
        {
            _unitOfWork = unitOfWork;
            _aiProviderClient = aiProviderClient;
            _subscriptionAccessService = subscriptionAccessService;
        }

        public async Task<Result<ChatResponseDto>> SendMessageAsync(
            Guid? userId, ChatRequestDto dto, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
                return Result<ChatResponseDto>.Failure("Message cannot be empty.");

            // If user is not logged in, respond directly without persisting
            if (!userId.HasValue)
            {
                var guestPromptBuilder = new System.Text.StringBuilder();
                guestPromptBuilder.AppendLine(SystemPrompt);
                guestPromptBuilder.AppendLine();
                guestPromptBuilder.AppendLine($"User: {dto.Message}");
                guestPromptBuilder.AppendLine("Assistant:");

                string guestAiReply;
                try
                {
                    guestAiReply = await _aiProviderClient.CompleteAsync(AIFeatureType.Chat, guestPromptBuilder.ToString(), cancellationToken);
                }
                catch (Exception)
                {
                    return Result<ChatResponseDto>.Failure("The AI assistant is currently unavailable. Please try again shortly.");
                }

                return Result<ChatResponseDto>.Success(new ChatResponseDto
                {
                    ConversationId = Guid.NewGuid(),
                    Reply = guestAiReply,
                    CreatedAt = DateTime.UtcNow,
                });
            }

            var currentUserId = userId.Value;

            // Check daily quota based on subscription tier
            var currentTier = await _subscriptionAccessService.GetCurrentTierAsync(currentUserId, cancellationToken);
            var usedToday = await _unitOfWork.ChatMessages.CountTodayByUserIdAsync(currentUserId, cancellationToken);

            int dailyLimit = currentTier switch
            {
                SubscriptionTier.Free => 5,
                SubscriptionTier.Pro => 50,
                _ => int.MaxValue
            };

            if (currentTier != SubscriptionTier.Premium && usedToday >= dailyLimit)
            {
                return Result<ChatResponseDto>.Failure(
                    $"Gündəlik AI sorğu limitinizə çatdınız ({usedToday}/{dailyLimit}). Limitsiz söhbət və hekayələr üçün planınızı yüksəldin.");
            }

            ChatConversation? conversation = null;

            if (dto.ConversationId.HasValue)
            {
                conversation = await _unitOfWork.ChatConversations.GetWithRecentMessagesAsync(
                    dto.ConversationId.Value, DefaultHistoryLimit, cancellationToken);

                if (conversation is null || conversation.AppUserId != currentUserId)
                    return Result<ChatResponseDto>.Failure("Conversation not found.");
            }
            else
            {
                conversation = new ChatConversation
                {
                    AppUserId = currentUserId,
                    Title = dto.Message.Length > 40 ? dto.Message[..40] + "..." : dto.Message,
                };
                await _unitOfWork.ChatConversations.AddAsync(conversation, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            var history = await _unitOfWork.ChatMessages.GetRecentByConversationIdAsync(
                conversation.Id, DefaultHistoryLimit, cancellationToken);

            var promptBuilder = new System.Text.StringBuilder();
            promptBuilder.AppendLine(SystemPrompt);
            var user = await _unitOfWork.Users.GetByIdAsync(currentUserId, cancellationToken);
            promptBuilder.AppendLine($"User's current CEFR level: {user?.LearningLevel ?? "A1"}");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Conversation history:");

            foreach (var pastMessage in history)
            {
                promptBuilder.AppendLine($"User: {pastMessage.UserMessage}");
                promptBuilder.AppendLine($"Assistant: {pastMessage.AIResponse}");
            }

            promptBuilder.AppendLine($"User: {dto.Message}");
            promptBuilder.AppendLine("Assistant:");

            string aiReply;
            try
            {
                aiReply = await _aiProviderClient.CompleteAsync(AIFeatureType.Chat, promptBuilder.ToString(), cancellationToken);
            }
            catch (Exception)
            {
                return Result<ChatResponseDto>.Failure("The AI assistant is currently unavailable. Please try again shortly.");
            }

            var message = new ChatMessage
            {
                AppUserId = currentUserId,
                ConversationId = conversation.Id,
                UserMessage = dto.Message,
                AIResponse = aiReply,
            };

            await _unitOfWork.ChatMessages.AddAsync(message, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<ChatResponseDto>.Success(new ChatResponseDto
            {
                ConversationId = conversation.Id,
                Reply = aiReply,
                CreatedAt = message.CreatedAt,
            });
        }

        public async Task<Result<IReadOnlyList<ChatConversationDto>>> GetConversationsAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var conversations = await _unitOfWork.ChatConversations.GetByUserIdAsync(userId, cancellationToken);

            var dtos = conversations.Select(c => new ChatConversationDto
            {
                Id = c.Id,
                Title = c.Title,
                CreatedAt = c.CreatedAt,
            }).ToList();

            return Result<IReadOnlyList<ChatConversationDto>>.Success(dtos);
        }

        public async Task<Result<IReadOnlyList<ChatMessageDto>>> GetMessagesAsync(
            Guid userId, Guid conversationId, int limit = 20, CancellationToken cancellationToken = default)
        {
            var conversation = await _unitOfWork.ChatConversations.GetByIdAsync(conversationId, cancellationToken);
            if (conversation is null || conversation.AppUserId != userId)
                return Result<IReadOnlyList<ChatMessageDto>>.Failure("Conversation not found.");

            var messages = await _unitOfWork.ChatMessages.GetRecentByConversationIdAsync(conversationId, limit, cancellationToken);

            var dtos = messages.Select(m => new ChatMessageDto
            {
                Id = m.Id,
                UserMessage = m.UserMessage,
                AIResponse = m.AIResponse,
                CreatedAt = m.CreatedAt,
            }).ToList();

            return Result<IReadOnlyList<ChatMessageDto>>.Success(dtos);
        }

        public async Task<Result<ChatUsageDto>> GetUsageAsync(
            Guid userId, CancellationToken cancellationToken = default)
        {
            var currentTier = await _subscriptionAccessService.GetCurrentTierAsync(userId, cancellationToken);
            var usedToday = await _unitOfWork.ChatMessages.CountTodayByUserIdAsync(userId, cancellationToken);

            int dailyLimit = currentTier switch
            {
                SubscriptionTier.Free => 5,
                SubscriptionTier.Pro => 50,
                _ => int.MaxValue
            };

            bool isUnlimited = currentTier == SubscriptionTier.Premium;
            int remaining = isUnlimited ? int.MaxValue : Math.Max(0, dailyLimit - usedToday);

            return Result<ChatUsageDto>.Success(new ChatUsageDto
            {
                Tier = currentTier.ToString(),
                UsedToday = usedToday,
                DailyLimit = isUnlimited ? -1 : dailyLimit,
                IsUnlimited = isUnlimited,
                Remaining = remaining,
            });
        }
    }
}