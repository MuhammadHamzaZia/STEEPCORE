using STEEPCOREAPI.Modules.Marketplace.Models;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Modules.Blueprints.Models;

public class Blueprint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.NotMapped] // Disabled to fix NoTypeLoading pooler crash
    public Pgvector.Vector? Embedding { get; set; }
    public string? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedByUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int ViewCount { get; set; }
    public int PurchaseCount { get; set; }
    public ICollection<FlowchartNode> Nodes { get; set; } = new List<FlowchartNode>();
    public ICollection<FlowchartEdge> Edges { get; set; } = new List<FlowchartEdge>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
