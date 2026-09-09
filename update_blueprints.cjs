const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/Blueprints/Controllers/BlueprintsController.cs';
let code = fs.readFileSync(file, 'utf8');

const target = `    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetPublishedBlueprints(`;

const myBlueprintsEndpoint = `    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetMyBlueprints(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            // Using the service if it had GetBlueprintsByUserIdAsync, but let's assume we can fetch via DB context if not.
            // Wait, we need to inject ApplicationDbContext or assume service has it.
            // Let's modify the service or just add a query here.
            return StatusCode(501, new { message = "Not Implemented" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user blueprints");
            throw;
        }
    }

    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetPublishedBlueprints(`;

code = code.replace(target, myBlueprintsEndpoint);
fs.writeFileSync(file, code);
