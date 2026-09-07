export interface IntegrationResource {
  title: string;
  url: string;
  type: string; // 'video', 'course', 'article', 'book', 'repo'
  locale?: string;
  metadata?: any;
}

export abstract class IntegrationAdapter {
  /**
   * Search the external platform for resources matching the query.
   */
  abstract search(query: string, limit?: number): Promise<IntegrationResource[]>;

  /**
   * Extract details from a specific resource URL/ID (useful for webhooks).
   */
  abstract fetchDetails(resourceId: string): Promise<IntegrationResource | null>;
}
