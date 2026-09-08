namespace STEEPCOREAPI.Shared.Interfaces;

/// <summary>
/// Interface for AI-driven blueprint generation service.
/// Handles integration with Large Language Models (e.g., Google Gemini).
/// </summary>
public interface IAiService
{
    /// <summary>
    /// Generates a structured learning roadmap based on a user prompt.
    /// </summary>
    /// <param name="userPrompt">User's learning goal or topic (e.g., "I want to learn .NET")</param>
    /// <returns>Structured blueprint DTO with nodes and edges representing a flowchart</returns>
    Task<AiBlueprintDto> GenerateRoadmapAsync(string userPrompt, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for AI-generated blueprint structure containing flowchart elements.
/// </summary>
public class AiBlueprintDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public List<AiNodeDto> Nodes { get; set; } = new();
    public List<AiEdgeDto> Edges { get; set; } = new();
}

/// <summary>
/// Represents a node in the flowchart (e.g., a learning step or concept).
/// </summary>
public class AiNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "default";
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public bool IsExpandable { get; set; }
}

/// <summary>
/// Represents an edge/connection between nodes in the flowchart.
/// </summary>
public class AiEdgeDto
{
    public string Id { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public string? Label { get; set; }
}
