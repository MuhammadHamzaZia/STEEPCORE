namespace STEEPCOREAPI.Modules.AiEngine.DTOs;

/// <summary>
/// DTO for AI roadmap generation request.
/// Contains user's learning goal/prompt.
/// </summary>
public class GenerateRequestDto
{
    /// <summary>
    /// User's learning goal or topic (e.g., "I want to learn .NET in 3 months").
    /// </summary>
    public string Prompt { get; set; } = string.Empty;
}
