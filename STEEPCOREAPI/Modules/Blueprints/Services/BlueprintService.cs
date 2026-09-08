using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;
using STEEPCOREAPI.Modules.Blueprints.Models;
using STEEPCOREAPI.Shared.Database;
using STEEPCOREAPI.Shared.Interfaces;

namespace STEEPCOREAPI.Modules.Blueprints.Services;

public class BlueprintService : IBlueprintService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BlueprintService> _logger;

    public BlueprintService(ApplicationDbContext context, ILogger<BlueprintService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Blueprint> SaveBlueprintAsync(Blueprint blueprint, CancellationToken cancellationToken = default)
    {
        if (blueprint == null)
            throw new ArgumentNullException(nameof(blueprint));
        if (string.IsNullOrWhiteSpace(blueprint.Title))
            throw new ArgumentException("Blueprint title is required", nameof(blueprint));

        try
        {
            if (blueprint.Id == Guid.Empty)
                blueprint.Id = Guid.NewGuid();

            blueprint.CreatedAt = DateTime.UtcNow;
            blueprint.UpdatedAt = DateTime.UtcNow;

            _context.Blueprints.Add(blueprint);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Blueprint saved: {BlueprintId}", blueprint.Id);
            return blueprint;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving blueprint");
            throw;
        }
    }

    public async Task<Blueprint> UpdateBlueprintAsync(Blueprint blueprint, CancellationToken cancellationToken = default)
    {
        if (blueprint == null)
            throw new ArgumentNullException(nameof(blueprint));

        try
        {
            var existing = await _context.Blueprints
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == blueprint.Id, cancellationToken)
                ?? throw new InvalidOperationException($"Blueprint {blueprint.Id} not found");

            blueprint.UpdatedAt = DateTime.UtcNow;
            blueprint.CreatedAt = existing.CreatedAt;

            _context.Blueprints.Update(blueprint);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Blueprint updated: {BlueprintId}", blueprint.Id);
            return blueprint;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blueprint");
            throw;
        }
    }

    public async Task<Blueprint?> GetBlueprintByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.Blueprints
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Include(b => b.CreatedByUser)
                .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blueprint");
            throw;
        }
    }

    public async Task<List<Blueprint>> SearchByEmbeddingAsync(float[] embedding, CancellationToken cancellationToken = default)
    {
        if (embedding == null)
            throw new ArgumentNullException(nameof(embedding));

        try
        {
            // Convert the raw float array to a pgvector type for the database query
            var searchVector = new Pgvector.Vector(embedding);

            return await _context.Blueprints
                .Where(b => b.IsPublished && b.Embedding != null)
                // Use pgvector's built-in mathematical distance calculation
                // removed
                .Take(5)
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Include(b => b.CreatedByUser)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in semantic search");
            throw;
        }
    }

    public async Task<List<Blueprint>> GetAllPublishedAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Invalid page or pageSize");

        try
        {
            return await _context.Blueprints
                .Where(b => b.IsPublished)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Include(b => b.CreatedByUser)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving published blueprints");
            throw;
        }
    }

    public async Task<List<Blueprint>> SearchByDomainAsync(string domain, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(domain) || page < 1 || pageSize < 1 || pageSize > 100)
            throw new ArgumentException("Invalid parameters");

        try
        {
            return await _context.Blueprints
                .Where(b => b.IsPublished && b.Domain.ToLower().Contains(domain.ToLower()))
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(b => b.Nodes)
                .Include(b => b.Edges)
                .Include(b => b.CreatedByUser)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching by domain");
            throw;
        }
    }

    public async Task<bool> DeleteBlueprintAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var blueprint = await _context.Blueprints
                .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

            if (blueprint == null)
                return false;

            _context.Blueprints.Remove(blueprint);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Blueprint deleted: {BlueprintId}", id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blueprint");
            throw;
        }
    }

    public async Task<int> IncrementViewCountAsync(Guid blueprintId, CancellationToken cancellationToken = default)
    {
        try
        {
            var blueprint = await _context.Blueprints
                .FirstOrDefaultAsync(b => b.Id == blueprintId, cancellationToken);

            if (blueprint != null)
            {
                blueprint.ViewCount++;
                blueprint.UpdatedAt = DateTime.UtcNow;
                _context.Blueprints.Update(blueprint);
                await _context.SaveChangesAsync(cancellationToken);
                return blueprint.ViewCount;
            }

            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error incrementing view count");
            return 0;
        }
    }

    public async Task<bool> UpdateEmbeddingAsync(Guid blueprintId, float[] embedding, CancellationToken cancellationToken = default)
    {
        if (embedding == null)
            throw new ArgumentNullException(nameof(embedding));

        try
        {
            var blueprint = await _context.Blueprints
                .FirstOrDefaultAsync(b => b.Id == blueprintId, cancellationToken);

            if (blueprint == null)
                return false;

            // Map the float array directly to Pgvector.Vector
            //blueprint.Embedding = new Pgvector.Vector(embedding);
            blueprint.UpdatedAt = DateTime.UtcNow;

            _context.Blueprints.Update(blueprint);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Embedding updated: {BlueprintId}", blueprintId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating embedding");
            throw;
        }
    }
}