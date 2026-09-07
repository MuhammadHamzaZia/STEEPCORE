export class PromptGuard {
  /**
   * Sanitizes user input to prevent prompt injection attacks.
   * This is a basic heuristic-based guard.
   */
  static sanitizeInput(input: string): string {
    if (!input) return "";

    const lowerInput = input.toLowerCase();

    // 1. Detect common prompt injection phrases
    const injectionPatterns = [
      "ignore previous instructions",
      "ignore all previous instructions",
      "system prompt",
      "you are now",
      "disregard",
      "bypass",
      "print out",
      "what were your instructions"
    ];

    for (const pattern of injectionPatterns) {
      if (lowerInput.includes(pattern)) {
        throw new Error("Security Violation: Detected potential prompt injection attempt.");
      }
    }

    // 2. Escape special characters that might confuse the LLM
    let sanitized = input.replace(/[<>{}\\[\\]]/g, "");

    // 3. Limit length
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500);
    }

    return sanitized.trim();
  }
}
