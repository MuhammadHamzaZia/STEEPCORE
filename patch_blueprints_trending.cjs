const fs = require('fs');
const file = '/app/applet/STEEPCOREAPI/Modules/Blueprints/Controllers/BlueprintsController.cs';
let code = fs.readFileSync(file, 'utf8');

const trendingMethods = `    [HttpGet("trending")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetTrendingBlueprints([FromQuery] int limit = 3, CancellationToken cancellationToken = default)
    {
        try
        {
            var blueprints = await _dbContext.Blueprints
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Where(b => b.IsPublished)
                .OrderByDescending(b => b.PurchaseCount)
                .ThenByDescending(b => b.ViewCount)
                .Take(Math.Max(1, Math.Min(limit, 20)))
                .ToListAsync(cancellationToken);
                
            return Ok(blueprints.Select(MapToResponse).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending blueprints");
            throw;
        }
    }

    [HttpGet("suggestions")]
    [AllowAnonymous]
    public async Task<ActionResult<List<string>>> GetQuickSuggestions(CancellationToken cancellationToken = default)
    {
        try
        {
            var suggestions = await _dbContext.Blueprints
                .Where(b => b.IsPublished && !string.IsNullOrEmpty(b.Domain))
                .GroupBy(b => b.Domain)
                .OrderByDescending(g => g.Count())
                .Take(6)
                .Select(g => g.Key)
                .ToListAsync(cancellationToken);
                
            if (suggestions.Count == 0)
                suggestions = new List<string> { "Microservices", "RAG Pipeline", "PostgreSQL", "FastAPI", "Kubernetes", "GraphQL" };
                
            return Ok(suggestions);
        }
        catch
        {
            return Ok(new List<string> { "Microservices", "RAG Pipeline", "PostgreSQL", "FastAPI", "Kubernetes", "GraphQL" });
        }
    }

    [HttpGet("domain-counts")]
    [AllowAnonymous]
    public async Task<ActionResult<Dictionary<string, int>>> GetDomainCounts(CancellationToken cancellationToken = default)
    {
        try
        {
            var counts = await _dbContext.Blueprints
                .Where(b => b.IsPublished && !string.IsNullOrEmpty(b.Domain))
                .GroupBy(b => b.Domain)
                .Select(g => new { Domain = g.Key, Count = g.Count() })
                .ToDictionaryAsync(k => k.Domain, v => v.Count, cancellationToken);
                
            return Ok(counts);
        }
        catch
        {
            return Ok(new Dictionary<string, int>());
        }
    }
`;

if (!code.includes('GetTrendingBlueprints')) {
    code = code.replace(
        '[HttpGet("published")]',
        trendingMethods + '\n    [HttpGet("published")]'
    );
    fs.writeFileSync(file, code);
}
