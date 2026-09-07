export class PIIStripper {
  /**
   * Sanitizes input strings by removing common Personally Identifiable Information (PII)
   */
  static sanitize(text: string): string {
    if (!text) return text;
    
    let sanitized = text;

    // 1. Remove Email Addresses
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

    // 2. Remove Phone Numbers (basic heuristic)
    sanitized = sanitized.replace(/\b\+?\d{1,3}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');

    // 3. Remove typical API Key formats (e.g., Bearer tokens, typical hex sequences)
    sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-\._~+\/]+=*/g, '[REDACTED_API_KEY]');
    sanitized = sanitized.replace(/[A-Za-z0-9]{32,}/g, '[REDACTED_TOKEN]');

    // 4. Remove Credit Card Numbers (basic heuristic for 13-19 digit sequences)
    sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CC]');

    return sanitized;
  }
}
