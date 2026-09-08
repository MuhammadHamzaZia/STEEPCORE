using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;
using STEEPCOREAPI.Modules.AiEngine.DTOs;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Shared.Database;
using STEEPCOREAPI.Shared.Interfaces;
using STEEPCOREAPI.Shared.Models;
using System.Security.Claims;

namespace STEEPCOREAPI.Modules.AiEngine.Controllers;

[EnableCors("AllowFrontend")]
[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AiController : ControllerBase
{
    private readonly IAiService _service;
    private readonly IEmbeddingService _embeddingService;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<AiController> _logger;

    public AiController(
        IAiService service,
        IEmbeddingService embeddingService,
        ApplicationDbContext dbContext,
        ILogger<AiController> logger)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
        _embeddingService = embeddingService ?? throw new ArgumentNullException(nameof(embeddingService));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("generate")]
    public async Task<ActionResult<AiBlueprintResponseDto>> GenerateRoadmap(
        [FromBody] GenerateRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Prompt) || request.Prompt.Length > 2000)
            return BadRequest("Invalid prompt");

        try
        {
            var userId = User.Identity?.IsAuthenticated == true
                ? User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                : null;

            _logger.LogInformation("Roadmap generation requested by {UserId}. Prompt: {Prompt}", userId ?? "Guest", request.Prompt);

            var cleanQuery = request.Prompt.Trim().ToLower();
            var normalizedInput = NormalizePrompt(request.Prompt);

            // TIER 1 & 2: Instant Exact & Multi-Keyword Title Match
            Blueprint? existingBlueprint = await _dbContext.Blueprints
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Where(b => b.Title.ToLower() == cleanQuery ||
                            b.Title.ToLower().Contains(normalizedInput) ||
                            normalizedInput.Contains(b.Title.ToLower()))
                .FirstOrDefaultAsync(cancellationToken);
            // TIER 3: Semantic Vector Search Fallback (Catches different phrasing and conceptual overlaps)
            if (existingBlueprint == null)
            {
                var promptVectorArray = await _embeddingService.GenerateEmbeddingAsync(request.Prompt, cancellationToken);
                var promptVector = new Pgvector.Vector(promptVectorArray);

                existingBlueprint = await _dbContext.Blueprints
                    .Include(b => b.Nodes)
                    .Include(b => b.Edges)
                    .Where(b => b.Embedding != null && b.Embedding.CosineDistance(promptVector) < 0.32)
                    .OrderBy(b => b.Embedding!.CosineDistance(promptVector))
                    .FirstOrDefaultAsync(cancellationToken);
            }

            if (existingBlueprint != null)
            {
                _logger.LogInformation("Lightning-fast cache HIT found. ID: {Id} for query: {Prompt}", existingBlueprint.Id, request.Prompt);
                return Ok(MapDbEntityToResponse(existingBlueprint));
            }

            _logger.LogInformation("Cache MISS. Triggering Gemini AI generation for: {Prompt}", request.Prompt);
            var generated = await _service.GenerateRoadmapAsync(request.Prompt, cancellationToken);

            if (generated == null || string.IsNullOrWhiteSpace(generated.Title))
            {
                return StatusCode(502, "Failed to retrieve a valid roadmap structure from AI.");
            }

            var embeddingText = $"{generated.Title}. {generated.Description}. {generated.Domain}";
            var blueprintVectorArray = await _embeddingService.GenerateEmbeddingAsync(embeddingText, cancellationToken);

            var blueprintId = Guid.NewGuid();
            var blueprint = new Blueprint
            {
                Id = blueprintId,
                Title = generated.Title,
                Description = generated.Description,
                Domain = generated.Domain,
                Price = (decimal)generated.Price,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsPublished = true,
                Embedding = new Pgvector.Vector(blueprintVectorArray)
            };

            var nodeMapping = new Dictionary<string, Guid>();
            var nodes = new List<FlowchartNode>();

            if (generated.Nodes != null)
            {
                foreach (var node in generated.Nodes)
                {
                    var dbNodeId = Guid.NewGuid();
                    nodeMapping[node.Id] = dbNodeId;

                    Enum.TryParse<FlowchartNodeType>(node.Type, true, out var parsedType);

                    nodes.Add(new FlowchartNode
                    {
                        Id = dbNodeId,
                        BlueprintId = blueprintId,
                        Label = node.Label,
                        Type = parsedType,
                        Description = string.Empty,
                        IsExpandable = node.IsExpandable
                    });
                }
            }

            var edges = new List<FlowchartEdge>();
            if (generated.Edges != null)
            {
                foreach (var edge in generated.Edges)
                {
                    if (nodeMapping.TryGetValue(edge.Source, out var sourceGuid) &&
                        nodeMapping.TryGetValue(edge.Target, out var targetGuid))
                    {
                        edges.Add(new FlowchartEdge
                        {
                            Id = Guid.NewGuid(),
                            BlueprintId = blueprintId,
                            SourceNodeId = sourceGuid,
                            TargetNodeId = targetGuid,
                            Label = edge.Label ?? string.Empty
                        });
                    }
                }
            }

            blueprint.Nodes = nodes;
            blueprint.Edges = edges;

            _dbContext.Blueprints.Add(blueprint);

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("New roadmap successfully generated and cached. ID: {BlueprintId}", blueprint.Id);
            }
            catch (DbUpdateException dbEx) when (dbEx.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
            {
                _logger.LogWarning("Concurrent insertion race condition handled for prompt: {Prompt}", request.Prompt);
                var concurrentMatch = await _dbContext.Blueprints
                    .Include(b => b.Nodes)
                    .Include(b => b.Edges)
                    .FirstOrDefaultAsync(b => b.Title == generated.Title, cancellationToken);

                if (concurrentMatch != null)
                {
                    return Ok(MapDbEntityToResponse(concurrentMatch));
                }
                throw;
            }

            return Ok(MapToResponse(generated));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating roadmap");
            throw;
        }
    }

    private static string NormalizePrompt(string input)
    {
        var cleaned = new string(input.ToLower()
            .Where(c => char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
            .ToArray());
        return string.Join(" ", cleaned.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
    }

    private static AiBlueprintResponseDto MapToResponse(AiBlueprintDto bp) => new()
    {
        Title = bp.Title,
        Description = bp.Description,
        Domain = bp.Domain,
        Price = bp.Price,
        Nodes = bp.Nodes?.Select(n => new STEEPCOREAPI.Modules.AiEngine.DTOs.AiNodeDto
        {
            Id = n.Id,
            Label = n.Label,
            Type = n.Type,
            PositionX = n.PositionX,
            PositionY = n.PositionY,
            IsExpandable = n.IsExpandable
        }).ToList() ?? new List<STEEPCOREAPI.Modules.AiEngine.DTOs.AiNodeDto>(),
        Edges = bp.Edges?.Select(e => new STEEPCOREAPI.Modules.AiEngine.DTOs.AiEdgeDto
        {
            Id = e.Id,
            Source = e.Source,
            Target = e.Target,
            Label = e.Label
        }).ToList() ?? new List<STEEPCOREAPI.Modules.AiEngine.DTOs.AiEdgeDto>()
    };

    private static AiBlueprintResponseDto MapDbEntityToResponse(Blueprint bp) => new()
    {
        Title = bp.Title,
        Description = bp.Description,
        Domain = bp.Domain,
        Price = (decimal)bp.Price,
        Nodes = bp.Nodes?.Select(n => new STEEPCOREAPI.Modules.AiEngine.DTOs.AiNodeDto
        {
            Id = n.Id.ToString(),
            Label = n.Label,
            Type = n.Type.ToString(),
            PositionX = 0,
            PositionY = 0,
            IsExpandable = n.IsExpandable
        }).ToList() ?? new List<STEEPCOREAPI.Modules.AiEngine.DTOs.AiNodeDto>(),
        Edges = bp.Edges?.Select(e => new STEEPCOREAPI.Modules.AiEngine.DTOs.AiEdgeDto
        {
            Id = e.Id.ToString(),
            Source = e.SourceNodeId.ToString(),
            Target = e.TargetNodeId.ToString(),
            Label = e.Label ?? string.Empty
        }).ToList() ?? new List<STEEPCOREAPI.Modules.AiEngine.DTOs.AiEdgeDto>()
    };
}