using STEEPCOREAPI.Modules.Blueprints.Models;

namespace STEEPCOREAPI.Shared.Interfaces;

/// <summary>
/// Interface for blueprint management service.
/// Handles CRUD operations and semantic search of learning roadmaps.
/// </summary>
public interface IBlueprintService
{
    /// <summary>
    /// Retrieves a blueprint by its ID with all associated nodes and edges.
    /// </summary>
    /// <param name="id">The blueprint ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The blueprint or null if not found</returns>
    Task<Blueprint?> GetBlueprintByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves a new blueprint with its nodes and edges.
    /// </summary>
    /// <param name="blueprint">The blueprint to save</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The saved blueprint with generated ID</returns>
    Task<Blueprint> SaveBlueprintAsync(Blueprint blueprint, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing blueprint and its associated elements.
    /// </summary>
    /// <param name="blueprint">The blueprint to update</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated blueprint</returns>
    Task<Blueprint> UpdateBlueprintAsync(Blueprint blueprint, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a blueprint and all its associated nodes and edges.
    /// </summary>
    /// <param name="id">The blueprint ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if deletion was successful, false otherwise</returns>
    Task<bool> DeleteBlueprintAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all published blueprints with pagination.
    /// </summary>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of published blueprints</returns>
    Task<List<Blueprint>> GetAllPublishedAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches for blueprints by domain/category.
    /// </summary>
    /// <param name="domain">The learning domain to search for</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of blueprints matching the domain</returns>
    Task<List<Blueprint>> SearchByDomainAsync(string domain, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs semantic search using embeddings.
    /// Returns the top 5 most similar blueprints based on embedding similarity.
    /// </summary>
    /// <param name="embedding">The embedding vector as float array (1536 dimensions)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Top 5 most similar blueprints ordered by similarity (highest first)</returns>
    Task<List<Blueprint>> SearchByEmbeddingAsync(float[] embedding, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increments the view count for a blueprint asynchronously.
    /// Used for tracking popular roadmaps.
    /// </summary>
    /// <param name="blueprintId">The blueprint ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated view count</returns>
    Task<int> IncrementViewCountAsync(Guid blueprintId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the vector embedding for a blueprint.
    /// Called after generating embeddings from external service.
    /// </summary>
    /// <param name="blueprintId">The blueprint ID</param>
    /// <param name="embedding">The new embedding vector as float array</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if update was successful</returns>
    Task<bool> UpdateEmbeddingAsync(Guid blueprintId, float[] embedding, CancellationToken cancellationToken = default);
}
