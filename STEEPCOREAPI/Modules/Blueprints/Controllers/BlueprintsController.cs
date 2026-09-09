using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pgvector.EntityFrameworkCore;
using STEEPCOREAPI.Modules.Blueprints.DTOs;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Shared.Interfaces;
using STEEPCOREAPI.Shared.Models;
using STEEPCOREAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace STEEPCOREAPI.Modules.Blueprints.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BlueprintsController : ControllerBase
{
    private readonly IBlueprintService _service;
    private readonly ILogger<BlueprintsController> _logger;
    private readonly ApplicationDbContext _dbContext;

    public BlueprintsController(IBlueprintService service, ILogger<BlueprintsController> logger, ApplicationDbContext dbContext)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<BlueprintResponseDto>> GetBlueprint(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
            return BadRequest(new { message = "Invalid blueprint ID" });

        try
        {
            var blueprint = await _service.GetBlueprintByIdAsync(id, cancellationToken);
            if (blueprint == null)
                return NotFound($"Blueprint {id} not found");

            _ = _service.IncrementViewCountAsync(id, cancellationToken).ConfigureAwait(false);

            return Ok(MapToResponse(blueprint));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blueprint");
            throw;
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<BlueprintResponseDto>> CreateBlueprint(
        CreateBlueprintRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Title is required" });

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            var blueprint = new Blueprint
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description ?? string.Empty,
                Domain = request.Domain ?? string.Empty,
                Price = request.Price ?? 0,
                IsPublished = request.IsPublished ?? false,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (request.Nodes?.Any() == true)
            {
                foreach (var nodeDto in request.Nodes)
                {
                    blueprint.Nodes.Add(new FlowchartNode
                    {
                        Id = Guid.NewGuid(),
                        Label = nodeDto.Label,
                        Type = ParseNodeType(nodeDto.Type),
                        PositionX = nodeDto.PositionX,
                        PositionY = nodeDto.PositionY,
                        Description = nodeDto.Description,
                        SubBlueprintId = nodeDto.SubBlueprintId,
                        IsExpandable = nodeDto.IsExpandable,
                        BlueprintId = blueprint.Id
                    });
                }
            }

            if (request.Edges?.Any() == true)
            {
                var nodeMap = blueprint.Nodes.ToDictionary(n => n.Label, n => n.Id);

                foreach (var edgeDto in request.Edges)
                {
                    var sourceId = edgeDto.SourceNodeId != Guid.Empty
                        ? edgeDto.SourceNodeId
                        : (nodeMap.TryGetValue(edgeDto.Source, out var id) ? id : Guid.Empty);

                    var targetId = edgeDto.TargetNodeId != Guid.Empty
                        ? edgeDto.TargetNodeId
                        : (nodeMap.TryGetValue(edgeDto.Target, out var id2) ? id2 : Guid.Empty);

                    if (sourceId != Guid.Empty && targetId != Guid.Empty)
                    {
                        blueprint.Edges.Add(new FlowchartEdge
                        {
                            Id = Guid.NewGuid(),
                            SourceNodeId = sourceId,
                            TargetNodeId = targetId,
                            Label = edgeDto.Label,
                            BlueprintId = blueprint.Id
                        });
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(blueprint.Title))
            {
                var embeddingFloats = GenerateMockEmbedding(blueprint.Title, blueprint.Description);
                // Directly map the float array to a Pgvector.Vector instead of a byte array
                blueprint.Embedding = new Pgvector.Vector(embeddingFloats);
            }

            var saved = await _service.SaveBlueprintAsync(blueprint, cancellationToken);
            return CreatedAtAction(nameof(GetBlueprint), new { id = saved.Id }, MapToResponse(saved));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blueprint");
            throw;
        }
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlueprintResponseDto>>> SearchBlueprints(
        [FromQuery] string query,
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || limit < 1 || limit > 20)
            return BadRequest(new { message = "Invalid query or limit" });

        try
        {
            var queryEmbedding = GenerateMockEmbedding(query);
            var results = await _service.SearchByEmbeddingAsync(queryEmbedding, cancellationToken);

            var response = results
                .Take(Math.Min(limit, 20))
                .Select(MapToResponse)
                .ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching blueprints");
            throw;
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetMyBlueprints(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            var myBlueprints = await _dbContext.Blueprints
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Where(b => b.CreatedByUserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync(cancellationToken);

            return Ok(myBlueprints.Select(MapToResponse).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user blueprints");
            throw;
        }
    }

        [HttpGet("trending")]
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

    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetPublishedBlueprints(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (pageSize < 1 || pageSize > 50)
            return BadRequest(new { message = "Invalid page size" });

        try
        {
            var blueprints = await _service.GetAllPublishedAsync(pageNumber, Math.Min(pageSize, 50), cancellationToken);
            var response = blueprints.Select(MapToResponse).ToList();
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving published blueprints");
            throw;
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<BlueprintResponseDto>> UpdateBlueprint(
        Guid id,
        UpdateBlueprintRequestDto request,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty || request == null)
            return BadRequest(new { message = "Invalid blueprint ID or request" });

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            var existing = await _service.GetBlueprintByIdAsync(id, cancellationToken);
            if (existing == null)
                return NotFound($"Blueprint {id} not found");

            if (existing.CreatedByUserId != userId)
                return Forbid();

            existing.Title = request.Title ?? existing.Title;
            existing.Description = request.Description ?? existing.Description;
            existing.Domain = request.Domain ?? existing.Domain;
            existing.Price = request.Price ?? existing.Price;
            existing.IsPublished = request.IsPublished ?? existing.IsPublished;

            var updated = await _service.UpdateBlueprintAsync(existing, cancellationToken);
            return Ok(MapToResponse(updated));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blueprint");
            throw;
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteBlueprint(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
            return BadRequest(new { message = "Invalid blueprint ID" });

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User not found" });

            var blueprint = await _service.GetBlueprintByIdAsync(id, cancellationToken);
            if (blueprint == null)
                return NotFound($"Blueprint {id} not found");

            if (blueprint.CreatedByUserId != userId)
                return Forbid();

            await _service.DeleteBlueprintAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blueprint");
            throw;
        }
    }

    private static BlueprintResponseDto MapToResponse(Blueprint bp) => new()
    {
        Id = bp.Id,
        Title = bp.Title,
        Description = bp.Description,
        Domain = bp.Domain,
        Price = bp.Price,
        IsPublished = bp.IsPublished,
        CreatedByUserId = bp.CreatedByUserId,
        CreatorName = bp.CreatedByUser?.FullName ?? "Unknown",
        ViewCount = bp.ViewCount,
        PurchaseCount = bp.PurchaseCount,
        CreatedAt = bp.CreatedAt,
        UpdatedAt = bp.UpdatedAt,
        Nodes = bp.Nodes?.Select(n => new NodeResponseDto
        {
            Id = n.Id,
            Label = n.Label,
            Type = n.Type.ToString(),
            PositionX = n.PositionX,
            PositionY = n.PositionY,
            Description = n.Description,
            SubBlueprintId = n.SubBlueprintId,
            IsExpandable = n.IsExpandable
        }).ToList() ?? new(),
        Edges = bp.Edges?.Select(e => new EdgeResponseDto
        {
            Id = e.Id,
            SourceNodeId = e.SourceNodeId,
            TargetNodeId = e.TargetNodeId,
            Label = e.Label
        }).ToList() ?? new()
    };

    private static FlowchartNodeType ParseNodeType(string type) =>
        type?.ToLower() switch
        {
            "input" => FlowchartNodeType.Input,
            "output" => FlowchartNodeType.Output,
            "process" => FlowchartNodeType.Process,
            "decision" => FlowchartNodeType.Decision,
            _ => FlowchartNodeType.Default
        };

    private static float[] GenerateMockEmbedding(string text, string? additional = null)
    {
        var combined = (text ?? "") + (additional ?? "");
        var hash = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(combined));

        var dimensions = new float[1536];
        for (int i = 0; i < 1536; i++)
        {
            var byteIndex = i % hash.Length;
            var normalizedValue = hash[byteIndex] / 255f;
            dimensions[i] = normalizedValue;
        }

        return dimensions;
    }
}