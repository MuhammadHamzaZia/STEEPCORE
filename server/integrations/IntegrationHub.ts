import { YouTubeAdapter } from './YouTubeAdapter';
import { UdemyAdapter } from './UdemyAdapter';
import { GitHubAdapter } from './GitHubAdapter';
import { IntegrationAdapter, IntegrationResource } from './IntegrationAdapter';

export class IntegrationHub {
  private static adapters: Record<string, IntegrationAdapter> = {
    youtube: new YouTubeAdapter(),
    udemy: new UdemyAdapter(),
    github: new GitHubAdapter(),
  };

  /**
   * Search across all platforms in parallel
   */
  static async enrichTopic(topic: string): Promise<IntegrationResource[]> {
    try {
      const promises = Object.values(this.adapters).map(adapter => adapter.search(topic, 2));
      const results = await Promise.allSettled(promises);
      
      const allResources: IntegrationResource[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allResources.push(...result.value);
        } else {
          console.error('[Integration Hub] Adapter failed:', result.reason);
        }
      });
      
      return allResources;
    } catch (error) {
      console.error('[Integration Hub] Enrichment failed:', error);
      return [];
    }
  }

  /**
   * Get specific adapter
   */
  static getAdapter(platform: string): IntegrationAdapter | undefined {
    return this.adapters[platform.toLowerCase()];
  }
}
