using System.Text.Json;
using System.Text.Json.Serialization;
using STEEPCOREAPI.Shared.Interfaces;

namespace STEEPCOREAPI.Modules.AiEngine.Services;

public class GeminiAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiAiService> _logger;

    // 1. Switched to gemini-2.5-flash to avoid 404s on deprecated model aliases
    private const string GeminiGenerateApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"; private const string SystemPrompt = @"You are an expert learning roadmap generator. 
Generate a detailed, structured learning path for the user's goal. 
Return ONLY valid JSON (no markdown, no explanations) matching this structure:
{
  ""title"": ""string"",
  ""description"": ""string"",
  ""domain"": ""string"",
  ""price"": 29.99,
  ""nodes"": [
    {
      ""id"": ""node-1"",
      ""label"": ""string"",
      ""type"": ""default"",
      ""positionX"": 0,
      ""positionY"": 0,
      ""isExpandable"": false
    }
  ],
  ""edges"": [
    {
      ""id"": ""edge-1"",
      ""source"": ""node-1"",
      ""target"": ""node-2"",
      ""label"": ""optional string""
    }
  ]
}
Each node must have unique ID. Edges must reference valid node IDs.
If a node represents a broad, complex topic that should be broken down into a separate nested sub-roadmap later, set ""isExpandable"": true.
Arrange nodes in logical sequence with proper positioning.
Ensure at least 5 nodes and 4 edges for comprehensive roadmap.";

    public GeminiAiService(HttpClient httpClient, IConfiguration config, ILogger<GeminiAiService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _config = config ?? throw new ArgumentNullException(nameof(config));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<AiBlueprintDto> GenerateRoadmapAsync(string userPrompt, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userPrompt))
            throw new ArgumentException("Prompt cannot be empty", nameof(userPrompt));

        var apiKey = _config["AiEngine:Gemini:ApiKey"] ?? _config["GEMINI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Gemini API key not configured in appsettings.json or environment variables");

        try
        {
            _logger.LogInformation("Generating roadmap for prompt: {Prompt}", userPrompt);

            var requestBody = new GeminiRequestDto
            {
                Contents = new[]
                {
                    new GeminiContentDto
                    {
                        Parts = new[]
                        {
                            new GeminiPartDto
                            {
                                Text = $"{SystemPrompt}\n\nUser Goal: {userPrompt}"
                            }
                        }
                    }
                },
                GenerationConfig = new GenerationConfigDto
                {
                    Temperature = 0.7,
                    TopP = 0.9,
                    MaxOutputTokens = 4096
                }
            };

            // 2. Clean URL without the ?key= parameter
            var apiUrl = GeminiGenerateApiUrl;

            // 3. Create request and add the AQ key securely to the Headers
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            requestMessage.Headers.Add("x-goog-api-key", apiKey);
            requestMessage.Content = new StringContent(
                JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull }),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(requestMessage, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Gemini API error: {StatusCode}. Details: {ErrorContent}", response.StatusCode, errorContent);

                // 4. If it fails, throw the exact JSON Google sent back so Swagger displays it
                throw new InvalidOperationException($"Google AI Error ({response.StatusCode}): {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            var generatedText = root
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(generatedText))
                throw new InvalidOperationException("Empty response from Gemini");

            _logger.LogInformation("Roadmap generated successfully");

            var cleanedJson = CleanJsonResponse(generatedText);
            var blueprint = JsonSerializer.Deserialize<AiBlueprintDto>(cleanedJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });

            if (blueprint == null)
                throw new InvalidOperationException("Failed to deserialize roadmap");

            ValidateBlueprintStructure(blueprint);

            return blueprint;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini AI Service");
            throw;
        }
    }

    private static string CleanJsonResponse(string response)
    {
        var trimmed = response.Trim();
        if (trimmed.StartsWith("```json"))
            trimmed = trimmed.Substring(7);
        if (trimmed.StartsWith("```"))
            trimmed = trimmed.Substring(3);
        if (trimmed.EndsWith("```"))
            trimmed = trimmed.Substring(0, trimmed.Length - 3);

        return trimmed.Trim();
    }

    private static void ValidateBlueprintStructure(AiBlueprintDto bp)
    {
        if (string.IsNullOrWhiteSpace(bp.Title))
            throw new InvalidOperationException("Blueprint title required");

        if (bp.Nodes == null || bp.Nodes.Count == 0)
            throw new InvalidOperationException("Blueprint must contain nodes");

        var nodeIds = new HashSet<string>();
        foreach (var node in bp.Nodes)
        {
            if (string.IsNullOrWhiteSpace(node.Id))
                throw new InvalidOperationException("Node ID cannot be empty");

            if (!nodeIds.Add(node.Id))
                throw new InvalidOperationException($"Duplicate node ID: {node.Id}");
        }

        if (bp.Edges != null)
        {
            foreach (var edge in bp.Edges)
            {
                if (!nodeIds.Contains(edge.Source))
                    throw new InvalidOperationException($"Invalid source node: {edge.Source}");

                if (!nodeIds.Contains(edge.Target))
                    throw new InvalidOperationException($"Invalid target node: {edge.Target}");
            }
        }
    }
}

internal class GeminiRequestDto
{
    [JsonPropertyName("contents")]
    public GeminiContentDto[]? Contents { get; set; }

    [JsonPropertyName("generationConfig")]
    public GenerationConfigDto? GenerationConfig { get; set; }
}

internal class GeminiContentDto
{
    [JsonPropertyName("parts")]
    public GeminiPartDto[]? Parts { get; set; }
}

internal class GeminiPartDto
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}

internal class GenerationConfigDto
{
    [JsonPropertyName("temperature")]
    public double Temperature { get; set; } = 0.7;

    [JsonPropertyName("topP")]
    public double TopP { get; set; } = 0.9;

    [JsonPropertyName("maxOutputTokens")]
    public int MaxOutputTokens { get; set; } = 4096;
}