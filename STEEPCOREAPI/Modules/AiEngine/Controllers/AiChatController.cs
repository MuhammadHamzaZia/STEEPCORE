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

        var response = await CallGeminiApi("gemini-1.5-pro", payload, apiKey);
        if (response == null) return StatusCode(502, new { text = "Failed to communicate with AI." });

        return Ok(new { text = ExtractTextFromGemini(response) });
    }

    [HttpPost]
    public async Task<ActionResult> ExpandNode([FromBody] ExpandNodeRequest req)
    {
        var apiKey = _config["GEMINI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey)) return StatusCode(500, new { error = "GEMINI_API_KEY is not set" });

        var promptInstruction = req.ExpansionType switch {
            "detailed" => "Provide an EXHAUSTIVE, university-grade deep dive. Break this topic into foundational concepts, advanced mechanisms, and expert-level nuances. Return a massive, highly researched 'phases' array containing rich descriptions.",
            "tools" => "List the absolute industry-standard tools, frameworks, and hidden enterprise software used by Senior Engineers for this topic. Explain WHY they are used. Return it as a highly detailed 'newNodes' array.",
            "projects" => "Generate highly complex, resume-worthy project ideas that solve real-world problems. Skip simple 'todo apps'. Return architecture requirements and learning outcomes for each project as a 'newNodes' array.",
            "resources" => "List the absolute best learning resources available globally: definitive textbooks, official documentation, whitepapers, and top-tier courses. Return it as a 'newNodes' array.",
            "interview" => "Generate the most difficult, system-design and theoretical interview questions asked by FAANG-level companies regarding this topic. Include the expected expert answers. Return it as a 'newNodes' array.",
            _ => "Provide a highly technical and completely comprehensive breakdown of this topic into exhaustive sub-topics. Return it as a 'newNodes' array."
        };

        var prompt = $@"You are a Senior Principal Architect and elite Curriculum Designer. The user wants to expand on a specific node in their learning roadmap.
        Node Label: {req.NodeLabel}
        Node Type: {req.NodeType}
        User Request: {req.PromptContext}
        Expansion Level: {req.ExpansionType}
        
        INSTRUCTION: {promptInstruction}
        
        IMPORTANT: Your output MUST be highly researched, extremely long and detailed, and perfectly accurate. 
        Format your response EXCLUSIVELY as a JSON object matching the requested array key ('phases' or 'newNodes'). Ensure the JSON contains deeply rich text fields.";

        var payload = new {
            contents = new[] { new { role = "user", parts = new[] { new { text = prompt } } } },
            generationConfig = new { temperature = 0.7, responseMimeType = "application/json" }
        };

        var response = await CallGeminiApi("gemini-1.5-pro", payload, apiKey);
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
