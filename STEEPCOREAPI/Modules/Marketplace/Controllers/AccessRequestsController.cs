using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace STEEPCOREAPI.Modules.Marketplace.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AccessRequestsController : ControllerBase
{
    private readonly ILogger<AccessRequestsController> _logger;

    public AccessRequestsController(ILogger<AccessRequestsController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    [Authorize]
    public IActionResult RequestAccess([FromBody] AccessRequestDto request)
    {
        if (request == null || request.BlueprintId == Guid.Empty)
        {
            return BadRequest(new { message = "Invalid blueprint ID" });
        }

        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        _logger.LogInformation($"User {userId} requested access to blueprint {request.BlueprintId} from creator {request.CreatorId}");
        
        // Normally, this would save to a database and notify the owner.
        // For now, we simulate a successful request queueing.
        return Ok(new { success = true, message = "Access request sent to author." });
    }
}

public class AccessRequestDto
{
    public Guid BlueprintId { get; set; }
    public string? CreatorId { get; set; }
}
