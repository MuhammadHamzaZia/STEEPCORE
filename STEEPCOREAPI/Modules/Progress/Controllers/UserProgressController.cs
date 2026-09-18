using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using STEEPCOREAPI.Shared.Database;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Modules.Progress.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class UserProgressController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    
    public UserProgressController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    [HttpGet("{blueprintId:guid}")]
    public async Task<ActionResult<IEnumerable<object>>> GetProgress(Guid blueprintId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();
        
        var progress = await _dbContext.UserProgresses
            .Where(up => up.UserId == userId && up.BlueprintId == blueprintId)
            .Select(up => new {
                id = up.Id,
                userId = up.UserId,
                blueprintId = up.BlueprintId,
                nodeId = up.NodeId,
                status = up.Status,
                notes = up.Notes,
                updatedAt = up.UpdatedAt
            })
            .ToListAsync(cancellationToken);
            
        return Ok(progress);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<object>>> GetSummary(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var progressList = await _dbContext.UserProgresses
            .AsNoTracking()
            .Where(up => up.UserId == userId && up.Status == "completed")
            .Select(up => new {
                blueprintId = up.BlueprintId,
                nodeId = up.NodeId,
                updatedAt = up.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        var summary = progressList
            .GroupBy(p => p.blueprintId)
            .Select(g => new {
                blueprintId = g.Key.ToString(),
                completedNodes = g.Select(x => x.nodeId.ToString()).ToList(),
                updatedAt = g.Max(x => x.updatedAt)
            })
            .ToList();

        return Ok(summary);
    }

    [HttpDelete("{blueprintId:guid}")]
    public async Task<ActionResult> ResetProgress(Guid blueprintId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var items = await _dbContext.UserProgresses
            .Where(up => up.UserId == userId && up.BlueprintId == blueprintId)
            .ToListAsync(cancellationToken);

        if (items.Count > 0)
        {
            _dbContext.UserProgresses.RemoveRange(items);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { success = true, message = "Progress reset successfully." });
    }
    
    [HttpPost("toggle")]
    public async Task<ActionResult> ToggleProgress([FromBody] ToggleProgressRequest req, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();
        
        var existing = await _dbContext.UserProgresses
            .FirstOrDefaultAsync(up => up.UserId == userId && up.NodeId == req.NodeId, cancellationToken);
            
        if (existing != null)
        {
            if (existing.Status == req.Status) {
                _dbContext.UserProgresses.Remove(existing);
            } else {
                existing.Status = req.Status;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }
        else
        {
            _dbContext.UserProgresses.Add(new UserProgress {
                UserId = userId,
                BlueprintId = req.BlueprintId,
                NodeId = req.NodeId,
                Status = req.Status
            });
        }
        
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(new { success = true });
    }
}

public class ToggleProgressRequest
{
    public Guid BlueprintId { get; set; }
    public Guid NodeId { get; set; }
    public string Status { get; set; } = "completed";
}
