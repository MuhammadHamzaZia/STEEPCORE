import { IntegrationAdapter, IntegrationResource } from './IntegrationAdapter';

export class UdemyAdapter extends IntegrationAdapter {
  async search(query: string, limit: number = 2): Promise<IntegrationResource[]> {
    console.log(`[Udemy Adapter] Searching for: ${query}`);
    // In production, call Udemy Affiliate API or Public API
    await new Promise(res => setTimeout(res, 500));
    
    return Array.from({ length: limit }).map((_, i) => ({
      title: `Udemy: Master ${query} from Scratch`,
      url: `https://udemy.com/course/mock-course-${query.replace(/\s+/g, '-')}-${i}`,
      type: 'course',
      metadata: { rating: 4.8, price: '$19.99', platform: 'udemy' }
    }));
  }

  async fetchDetails(resourceId: string): Promise<IntegrationResource | null> {
    return {
      title: `Updated Udemy Course ${resourceId}`,
      url: `https://udemy.com/course/${resourceId}`,
      type: 'course',
      metadata: { updated_at: new Date().toISOString(), platform: 'udemy' }
    };
  }
}
