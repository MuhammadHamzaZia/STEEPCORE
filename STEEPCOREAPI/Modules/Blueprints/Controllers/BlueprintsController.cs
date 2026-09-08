using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pgvector.EntityFrameworkCore;
using STEEPCOREAPI.Modules.Blueprints.DTOs;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Shared.Interfaces;
using STEEPCOREAPI.Shared.Models;

namespace STEEPCOREAPI.Modules.Blueprints.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BlueprintsController : ControllerBase
{
    private readonly IBlueprintService _service;
    private readonly ILogger<BlueprintsController> _logger;

    public BlueprintsController(IBlueprintService service, ILogger<BlueprintsController> logger)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<BlueprintResponseDto>> GetBlueprint(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
            return BadRequest("Invalid blueprint ID");

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
            return BadRequest("Title is required");

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User not found");

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
            return BadRequest("Invalid query or limit");

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

    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlueprintResponseDto>>> GetPublishedBlueprints(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (pageSize < 1 || pageSize > 50)
            return BadRequest("Invalid page size");

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
            return BadRequest("Invalid blueprint ID or request");

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User not found");

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
            return BadRequest("Invalid blueprint ID");

        try
        {
            var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User not found");

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