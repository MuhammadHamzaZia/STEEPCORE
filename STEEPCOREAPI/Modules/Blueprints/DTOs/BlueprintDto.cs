namespace STEEPCOREAPI.Modules.Blueprints.DTOs;

public class BlueprintDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public int PurchaseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<NodeResponseDto> Nodes { get; set; } = new();
    public List<EdgeResponseDto> Edges { get; set; } = new();
}

public class NodeResponseDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "default";
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public string? Description { get; set; }
    public Guid? SubBlueprintId { get; set; }
    public bool IsExpandable { get; set; }
}

public class EdgeResponseDto
{
    public Guid Id { get; set; }
    public Guid SourceNodeId { get; set; }
    public Guid TargetNodeId { get; set; }
    public string? Label { get; set; }
}

public class BlueprintResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public int PurchaseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<NodeResponseDto> Nodes { get; set; } = new();
    public List<EdgeResponseDto> Edges { get; set; } = new();
}

public class CreateBlueprintRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Domain { get; set; }
    public decimal? Price { get; set; }
    public bool? IsPublished { get; set; }
    public List<CreateNodeRequestDto> Nodes { get; set; } = new();
    public List<CreateEdgeRequestDto> Edges { get; set; } = new();
}

public class CreateNodeRequestDto
{
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "default";
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public string? Description { get; set; }
    public Guid? SubBlueprintId { get; set; }
    public bool IsExpandable { get; set; }
}

public class CreateEdgeRequestDto
{
    public Guid SourceNodeId { get; set; } = Guid.Empty;
    public Guid TargetNodeId { get; set; } = Guid.Empty;
    public string Source { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public string? Label { get; set; }
}

public class UpdateBlueprintRequestDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Domain { get; set; }
    public decimal? Price { get; set; }
    public bool? IsPublished { get; set; }
}
