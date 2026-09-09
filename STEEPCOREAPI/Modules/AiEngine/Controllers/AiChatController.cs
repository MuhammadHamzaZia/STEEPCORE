using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace STEEPCOREAPI.Modules.AiEngine.Controllers;

[ApiController]
[Route("api/ai/[action]")]
public class AiChatController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly ILogger<AiChatController> _logger;
    private readonly HttpClient _httpClient;

    public AiChatController(IConfiguration config, ILogger<AiChatController> logger, HttpClient httpClient)
    {
        _config = config;
        _logger = logger;
        _httpClient = httpClient;
    }

    [HttpPost]
    public async Task<ActionResult> Chat([FromBody] ChatRequest req)
    {
        var apiKey = _config["GEMINI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey)) return StatusCode(500, new { error = "GEMINI_API_KEY is not set" });

        var contents = req.Messages.Select(m => new {
            role = m.Role == "user" ? "user" : "model",
            parts = new[] { new { text = m.Content } }
        }).ToArray();

        var payload = new {
            contents = contents,
            systemInstruction = new {
                parts = new[] { new { text = $"You are an expert learning assistant helping a user with their {req.Context?.Role ?? "learning"} roadmap. Keep your answers concise, practical, and encouraging." } }
            },
            generationConfig = new { temperature = 0.7 }
        };

        var response = await CallGeminiApi("gemini-3.5-flash", payload, apiKey);
        if (response == null) return StatusCode(502, new { text = "Failed to communicate with AI." });

        return Ok(new { text = ExtractTextFromGemini(response) });
    }

    [HttpPost]
    public async Task<ActionResult> ExpandNode([FromBody] ExpandNodeRequest req)
    {
        var apiKey = _config["GEMINI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey)) return StatusCode(500, new { error = "GEMINI_API_KEY is not set" });

        var promptInstruction = req.ExpansionType switch {
            "detailed" => "Please generate a detailed hierarchical structure (phases -> topics -> concepts/courses) branching from this node. Return it as 'phases' array.",
            "tools" => "Please generate a list of essential tools, frameworks, or software required for this node. Return it as 'newNodes' array.",
            "projects" => "Please generate a list of practical project ideas to master the skills in this node. Return it as 'newNodes' array.",
            "resources" => "Please generate a list of recommended learning resources (books, courses, docs) for this node. Return it as 'newNodes' array.",
            "interview" => "Please generate a list of common interview questions or topics related to this node. Return it as 'newNodes' array.",
            _ => "Please generate a flat list of sub-topics or concepts for this specific node. Return it as 'newNodes' array."
        };

        var prompt = $@"The user wants to expand on a specific node in their learning roadmap.
        Node Label: {req.NodeLabel}
        Node Type: {req.NodeType}
        User Request: {req.PromptContext}
        Expansion Level: {req.ExpansionType}
        {promptInstruction}";

        var payload = new {
            contents = new[] { new { role = "user", parts = new[] { new { text = prompt } } } },
            generationConfig = new { temperature = 0.7, responseMimeType = "application/json" }
        };

        var response = await CallGeminiApi("gemini-3.5-flash", payload, apiKey);
        if (response == null) return StatusCode(502, new { error = "Failed to communicate with AI." });

        var textResponse = ExtractTextFromGemini(response);
        try {
            var json = JsonSerializer.Deserialize<JsonDocument>(textResponse);
            return Ok(json);
        } catch {
            return StatusCode(500, new { error = "AI returned invalid JSON formatting." });
        }
    }

    private async Task<JsonDocument?> CallGeminiApi(string model, object payload, string apiKey)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
        var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        
        if (!response.IsSuccessStatusCode) {
            _logger.LogError("Gemini API Error: {Error}", await response.Content.ReadAsStringAsync());
            return null;
        }
        
        var responseBody = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonDocument>(responseBody);
    }

    private string ExtractTextFromGemini(JsonDocument doc)
    {
        try {
            return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "";
        } catch {
            return "{}";
        }
    }
}

public class ChatRequest
{
    public ChatMessage[] Messages { get; set; } = Array.Empty<ChatMessage>();
    public ChatContext? Context { get; set; }
}

public class ChatMessage
{
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
}

public class ChatContext
{
    public string? Role { get; set; }
}

public class ExpandNodeRequest
{
    public string NodeLabel { get; set; } = "";
    public string NodeType { get; set; } = "";
    public string PromptContext { get; set; } = "";
    public string ExpansionType { get; set; } = "";
}
