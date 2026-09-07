import { db } from '../config/db';
import { IntegrationHub } from '../integrations/IntegrationHub';
import { randomUUID } from 'crypto';

export class ResourceEnricher {
  /**
   * Run enrichment for a specific node.
   * Fetches resources from external platforms and saves them to the DB.
   */
  static async enrichNode(nodeId: string, nodeTitle: string) {
    console.log(`[Resource Enricher] Starting background enrichment for node: ${nodeTitle}`);
    
    const resources = await IntegrationHub.enrichTopic(nodeTitle);
    
    if (resources.length === 0) {
      console.log(`[Resource Enricher] No external resources found for: ${nodeTitle}`);
      return;
    }

    // Save to database
    for (const res of resources) {
      const resourceId = randomUUID();
      await db.execute({
        sql: `INSERT OR REPLACE INTO resources (id, node_id, title, url, type, locale, votes)
              VALUES (?, ?, ?, ?, ?, 'en-US', 0)`,
        args: [resourceId, nodeId, res.title, res.url, res.type]
      });
    }

    console.log(`[Resource Enricher] Saved ${resources.length} enriched resources for node: ${nodeTitle}`);
  }

  /**
   * Run enrichment for an entire roadmap's topics asynchronously.
   * This acts like the "cron job" or async pipeline triggered after roadmap generation.
   */
  static async enrichRoadmapBackground(roadmapId: string) {
    try {
      // Find all leaf nodes (topics/concepts) that need enrichment
      // For simplicity, we just fetch 'topic' nodes
      const results = await db.execute({
        sql: `SELECT id, title FROM nodes WHERE roadmap_id = ? AND type = 'topic'`,
        args: [roadmapId]
      });

      for (const node of results.rows) {
        // Enqueue or run sequentially
        await this.enrichNode(node.id as string, node.title as string);
      }
      
      console.log(`[Resource Enricher] Roadmap ${roadmapId} enrichment complete.`);
    } catch (error) {
      console.error(`[Resource Enricher] Failed to enrich roadmap ${roadmapId}:`, error);
    }
  }
}
