namespace STEEPCOREAPI.Modules.Blueprints.Models;

public class FlowchartEdge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SourceNodeId { get; set; }
    public FlowchartNode? SourceNode { get; set; }
    public Guid TargetNodeId { get; set; }
    public FlowchartNode? TargetNode { get; set; }
    public string? Label { get; set; }
    public Guid BlueprintId { get; set; }
    public Blueprint? Blueprint { get; set; }
}
