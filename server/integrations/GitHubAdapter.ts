import { IntegrationAdapter, IntegrationResource } from './IntegrationAdapter';

export class GitHubAdapter extends IntegrationAdapter {
  async search(query: string, limit: number = 2): Promise<IntegrationResource[]> {
    console.log(`[GitHub Adapter] Searching for: ${query}`);
    // In production, call GitHub Search API
    await new Promise(res => setTimeout(res, 500));
    
    return Array.from({ length: limit }).map((_, i) => ({
      title: `GitHub Repo: awesome-${query.replace(/\s+/g, '-')}-${i}`,
      url: `https://github.com/mockuser/awesome-${query.replace(/\s+/g, '-')}-${i}`,
      type: 'repo',
      metadata: { stars: 1500, language: 'TypeScript', platform: 'github' }
    }));
  }

  async fetchDetails(resourceId: string): Promise<IntegrationResource | null> {
    return {
      title: `Updated Repo ${resourceId}`,
      url: `https://github.com/${resourceId}`,
      type: 'repo',
      metadata: { updated_at: new Date().toISOString(), platform: 'github' }
    };
  }
}
