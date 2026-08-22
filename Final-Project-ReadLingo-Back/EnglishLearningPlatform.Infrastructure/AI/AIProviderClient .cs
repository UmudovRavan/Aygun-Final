using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.AI
{
    public class AIProviderClient : IAIProviderClient
    {
        private readonly HttpClient _httpClient;
        private readonly AISettings _settings;
        private readonly ILogger<AIProviderClient> _logger;

        public AIProviderClient(HttpClient httpClient, IOptions<AISettings> settings, ILogger<AIProviderClient> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<string> CompleteAsync(
            AIFeatureType featureType, string prompt, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                _logger.LogWarning("AI provider API key is not configured; returning placeholder response.");
                return "AI features are not configured on this server yet. Please configure the AI API Key.";
            }

            var endpoint = ResolveEndpoint(_settings.BaseUrl);
            var model = string.IsNullOrWhiteSpace(_settings.Model) ? "deepseek-chat" : _settings.Model;

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey.Trim());

                var requestBody = new DeepSeekChatRequest
                {
                    Model = model,
                    Messages = new List<DeepSeekChatMessage>
                    {
                        new() { Role = "user", Content = prompt }
                    },
                    Stream = false
                };

                request.Content = JsonContent.Create(requestBody);

                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                var timeout = _settings.TimeoutSeconds > 0 ? _settings.TimeoutSeconds : 60;
                cts.CancelAfter(TimeSpan.FromSeconds(timeout));

                var response = await _httpClient.SendAsync(request, cts.Token);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync(cts.Token);
                    _logger.LogError("DeepSeek AI API call failed with status {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                    throw new HttpRequestException($"AI Provider error ({response.StatusCode}): {errorBody}");
                }

                var payload = await response.Content.ReadFromJsonAsync<DeepSeekChatResponse>(
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, 
                    cancellationToken: cts.Token);

                var replyContent = payload?.Choices?.FirstOrDefault()?.Message?.Content;
                return replyContent?.Trim() ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI provider call failed for feature {FeatureType}", featureType);
                throw;
            }
        }

        private static string ResolveEndpoint(string? baseUrl)
        {
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return "https://api.deepseek.com/chat/completions";
            }

            var cleanUrl = baseUrl.Trim().TrimEnd('/');
            if (cleanUrl.EndsWith("/chat/completions", StringComparison.OrdinalIgnoreCase))
            {
                return cleanUrl;
            }
            if (cleanUrl.EndsWith("/v1", StringComparison.OrdinalIgnoreCase))
            {
                return $"{cleanUrl}/chat/completions";
            }

            return $"{cleanUrl}/chat/completions";
        }

        public class DeepSeekChatRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = "deepseek-chat";

            [JsonPropertyName("messages")]
            public List<DeepSeekChatMessage> Messages { get; set; } = new();

            [JsonPropertyName("stream")]
            public bool Stream { get; set; } = false;
        }

        public class DeepSeekChatMessage
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = "user";

            [JsonPropertyName("content")]
            public string Content { get; set; } = string.Empty;
        }

        public class DeepSeekChatResponse
        {
            [JsonPropertyName("id")]
            public string? Id { get; set; }

            [JsonPropertyName("choices")]
            public List<DeepSeekChoice>? Choices { get; set; }
        }

        public class DeepSeekChoice
        {
            [JsonPropertyName("index")]
            public int Index { get; set; }

            [JsonPropertyName("message")]
            public DeepSeekChatMessage? Message { get; set; }

            [JsonPropertyName("finish_reason")]
            public string? FinishReason { get; set; }
        }
    }
}

