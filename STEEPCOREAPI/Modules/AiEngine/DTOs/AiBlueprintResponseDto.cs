namespace STEEPCOREAPI.Modules.AiEngine.DTOs;

/// <summary>
/// DTO for AI-generated blueprint response.
/// Contains complete roadmap structure with nodes and edges.
/// </summary>
public class AiBlueprintResponseDto
{
    /// <summary>
    /// Generated roadmap title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Roadmap description and overview.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Learning domain/subject area.
    /// </summary>
    public string Domain { get; set; } = string.Empty;

    /// <summary>
    /// Suggested price for the roadmap.
    /// </summary>
    public decimal Price { get; set; } = 29.99m;

    /// <summary>
    /// Collection of learning steps/nodes in the roadmap.
    /// </summary>
    public List<AiNodeDto> Nodes { get; set; } = new();

    /// <summary>
    /// Collection of connections/edges between nodes.
    /// </summary>
    public List<AiEdgeDto> Edges { get; set; } = new();
}

/// <summary>
/// DTO for a flowchart node in AI-generated roadmap.
/// </summary>
public class AiNodeDto
{
    /// <summary>
    /// Unique identifier for the node.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Display label for the learning step.
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Node type (default, input, output, process, decision).
    /// </summary>
    public string Type { get; set; } = "default";

    /// <summary>
    /// X coordinate position on canvas.
    /// </summary>
    public double PositionX { get; set; }

    /// <summary>
    /// Y coordinate position on canvas.
    /// </summary>
    public double PositionY { get; set; }

    /// <summary>
    /// Indicates if this node is a complex topic that can be expanded into a sub-roadmap.
    /// </summary>
    public bool IsExpandable { get; set; }

    /// <summary>
    /// Optional description or additional details.
    /// </summary>
    public string? Description { get; set; }
}

/// <summary>
/// DTO for a flowchart edge in AI-generated roadmap.
/// </summary>
public class AiEdgeDto
{
    /// <summary>
    /// Unique identifier for the edge.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID of the source node.
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// ID of the target node.
    /// </summary>
    public string Target { get; set; } = string.Empty;

    /// <summary>
    /// Optional label describing the edge relationship.
    /// </summary>
    public string? Label { get; set; }
}
