using System;
using STEEPCOREAPI.Modules.Blueprints.Models;

namespace STEEPCOREAPI.Shared.Models;

public class UserProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    
    public Guid BlueprintId { get; set; }
    public Blueprint? Blueprint { get; set; }
    
    public Guid NodeId { get; set; }
    public FlowchartNode? Node { get; set; }
    
    public string Status { get; set; } = "completed"; // "started", "completed", "skipped"
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
