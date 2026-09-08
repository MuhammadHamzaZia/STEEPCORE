using System.Text.Json;
using System.Text.Json.Serialization;
using STEEPCOREAPI.Shared.Interfaces;

namespace STEEPCOREAPI.Modules.AiEngine.Services;

/// <summary>
/// Production implementation of IEmbeddingService using Google Gemini API.
/// Generates text embeddings for semantic search and similarity operations.
/// </summary>
public class GeminiEmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiEmbeddingService> _logger;

    // Use the batch endpoint to match the plural JSON response format
    private const string GeminiEmbedApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents";

    public GeminiEmbeddingService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiEmbeddingService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Text cannot be empty", nameof(text));

        try
        {
            _logger.LogInformation("Generating embedding for text: {TextLength} characters", text.Length);

            var embeddings = await GenerateEmbeddingBatchAsync(new List<string> { text }, cancellationToken);

            if (embeddings == null || embeddings.Count == 0)
                throw new InvalidOperationException("Failed to generate embedding from Gemini API");

            return embeddings[0];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating embedding");
            throw;
        }
    }

    public async Task<List<float[]>> GenerateEmbeddingBatchAsync(List<string> texts, CancellationToken cancellationToken = default)
    {
        if (texts == null || texts.Count == 0)
            throw new ArgumentException("Texts list cannot be empty", nameof(texts));

        try
        {
            _logger.LogInformation("Generating batch embeddings for {Count} texts", texts.Count);

            var apiKey = _configuration["AiEngine:Gemini:ApiKey"] ?? _configuration["GEMINI_API_KEY"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Gemini API key not configured in appsettings.json or environment variables");

            var result = new List<float[]>();

            var batchSize = 100;
            for (int i = 0; i < texts.Count; i += batchSize)
            {
                var batch = texts.Skip(i).Take(batchSize).ToList();
                var batchEmbeddings = await CallGeminiEmbeddingApiAsync(batch, apiKey, cancellationToken);
                result.AddRange(batchEmbeddings);
            }

            _logger.LogInformation("Successfully generated {Count} embeddings", result.Count);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating batch embeddings");
            throw;
        }
    }

    private async Task<List<float[]>> CallGeminiEmbeddingApiAsync(
        List<string> texts,
        string apiKey,
        CancellationToken cancellationToken)
    {
        try
        {
            // Format requests array for batchEmbedContents
            var requestBody = new GeminiBatchEmbeddingRequestDto
            {
                Requests = texts.Select(t => new GeminiEmbeddingRequestDto
                {
                    Model = "models/text-embedding-004",
                    Content = new EmbeddingContentDto
                    {
                        Parts = new List<EmbeddingPartDto> { new EmbeddingPartDto { Text = t } }
                    }
                }).ToList()
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

            var url = $"{GeminiEmbedApiUrl}?key={apiKey}";
            var response = await _httpClient.PostAsync(url, content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Gemini API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                throw new InvalidOperationException($"Gemini API returned {response.StatusCode}: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<GeminiEmbeddingResponseDto>(responseContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Embeddings == null || result.Embeddings.Count == 0)
                throw new InvalidOperationException("No embeddings returned from Gemini API");

            var embeddings = result.Embeddings
                .Select(e => e.Values?.ToArray() ?? Array.Empty<float>())
                .ToList();

            _logger.LogInformation("Received {Count} embeddings from Gemini API", embeddings.Count);
            return embeddings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini embedding API");
            throw;
        }
    }
}

#region Gemini Embedding API DTOs

internal class GeminiBatchEmbeddingRequestDto
{
    [JsonPropertyName("requests")]
    public List<GeminiEmbeddingRequestDto>? Requests { get; set; }
}

internal class GeminiEmbeddingRequestDto
{
    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("content")]
    public EmbeddingContentDto? Content { get; set; }
}

internal class EmbeddingContentDto
{
    [JsonPropertyName("parts")]
    public List<EmbeddingPartDto>? Parts { get; set; }
}

internal class EmbeddingPartDto
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}

internal class GeminiEmbeddingResponseDto
{
    [JsonPropertyName("embeddings")]
    public List<EmbeddingValueDto>? Embeddings { get; set; }
}

internal class EmbeddingValueDto
{
    [JsonPropertyName("values")]
    public List<float>? Values { get; set; }
}

#endregion