const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/Blueprints/Controllers/BlueprintsController.cs';
let code = fs.readFileSync(file, 'utf8');

// Add ApplicationDbContext using if not exists
if (!code.includes('using STEEPCOREAPI.Data;')) {
    code = code.replace('using STEEPCOREAPI.Shared.Models;', 'using STEEPCOREAPI.Shared.Models;\nusing STEEPCOREAPI.Data;\nusing Microsoft.EntityFrameworkCore;');
}

// Update constructor
const constructorOld = `    private readonly IBlueprintService _service;
    private readonly ILogger<BlueprintsController> _logger;

    public BlueprintsController(IBlueprintService service, ILogger<BlueprintsController> logger)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }`;

const constructorNew = `    private readonly IBlueprintService _service;
    private readonly ILogger<BlueprintsController> _logger;
    private readonly ApplicationDbContext _dbContext;

    public BlueprintsController(IBlueprintService service, ILogger<BlueprintsController> logger, ApplicationDbContext dbContext)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }`;
code = code.replace(constructorOld, constructorNew);

// Replace the GetMyBlueprints body
const getMyOld = `            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            // Using the service if it had GetBlueprintsByUserIdAsync, but let's assume we can fetch via DB context if not.
            // Wait, we need to inject ApplicationDbContext or assume service has it.
            // Let's modify the service or just add a query here.
            return StatusCode(501, new { message = "Not Implemented" });`;

const getMyNew = `            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            var myBlueprints = await _dbContext.Blueprints
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Where(b => b.CreatedByUserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync(cancellationToken);

            return Ok(myBlueprints.Select(MapToResponse).ToList());`;
code = code.replace(getMyOld, getMyNew);

fs.writeFileSync(file, code);
