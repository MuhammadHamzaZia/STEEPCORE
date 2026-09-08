namespace STEEPCOREAPI.Shared.Interfaces;

/// <summary>
/// Interface for embedding generation service.
/// Generates vector embeddings for semantic search.
/// </summary>
public interface IEmbeddingService
{
    /// <summary>
    /// Generates an embedding vector for the given text.
    /// Uses configured embedding model (e.g., Gemini, OpenAI).
    /// </summary>
    /// <param name="text">Text to embed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Embedding as float array</returns>
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates embeddings for multiple texts in batch.
    /// </summary>
    /// <param name="texts">Texts to embed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of embeddings</returns>
    Task<List<float[]>> GenerateEmbeddingBatchAsync(List<string> texts, CancellationToken cancellationToken = default);
}
