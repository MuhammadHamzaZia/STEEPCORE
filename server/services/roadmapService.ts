import { db } from '../config/db';
import { getCache, setCache } from '../config/cache';
import { dbQueryDuration, cacheHits, cacheMisses } from './telemetry';

// Service to handle Advanced Roadmaps (Etsy-like)
export class RoadmapService {
  /**
   * Fetch a full roadmap by its slug (e.g. 'software-engineer')
   * Implements the multi-tiered caching strategy (Memory -> DB)
   */
  static async getRoadmapBySlug(slug: string, userId?: string) {
    const cacheKey = `roadmap_v2:${slug}`;
    
    // 1. Hot Data: Try Redis (LRU Cache)
    let roadmapData: any = await getCache(cacheKey);

    if (roadmapData) {
      cacheHits.labels('redis').inc();
      console.log(`[Cache Hit] Serving advanced roadmap for slug: ${slug} from memory.`);
    } else {
      cacheMisses.labels('redis').inc();

      // 2. Cold Data: Fetch from DB (Relational Graph Model)
      const endDbTimer = dbQueryDuration.startTimer({ query_type: 'select', table: 'roadmaps_v2_graph' });
      const roadmapRes = await db.execute({
        sql: `SELECT * FROM roadmaps_v2 WHERE slug = ? AND is_published = 1`,
        args: [slug]
      });

      if (roadmapRes.rows.length === 0) {
        endDbTimer();
        return null;
      }
      const roadmap = roadmapRes.rows[0];

      // Fetch associated Nodes
      const nodesRes = await db.execute({
        sql: `SELECT * FROM nodes WHERE roadmap_id = ? ORDER BY order_index ASC`,
        args: [roadmap.id as string]
      });

      // Fetch associated Edges
      const edgesRes = await db.execute({
        sql: `SELECT * FROM edges WHERE roadmap_id = ?`,
        args: [roadmap.id as string]
      });

      // Fetch associated Resources (can be joined or fetched separately)
      const resourcesRes = await db.execute({
        sql: `SELECT * FROM resources WHERE node_id IN (SELECT id FROM nodes WHERE roadmap_id = ?)`,
        args: [roadmap.id as string]
      });
      endDbTimer();

      // Reconstruct Graph Payload
      roadmapData = {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        is_premium: roadmap.is_premium,
        price: roadmap.price,
        metadata: roadmap.metadata ? JSON.parse(roadmap.metadata as string) : {},
        nodes: nodesRes.rows.map(n => ({
          ...n,
          metadata: n.metadata ? JSON.parse(n.metadata as string) : {}
        })),
        edges: edgesRes.rows.map(e => ({
          ...e,
          metadata: e.metadata ? JSON.parse(e.metadata as string) : {}
        })),
        resources: resourcesRes.rows
      };

      // 3. Cache the Cold Data
      await setCache(cacheKey, roadmapData);
    }

    // 4. Freemium Access Control Middleware Logic
    if (roadmapData.is_premium) {
      let hasAccess = false;
      
      if (userId) {
        const accessCacheKey = `user:${userId}:purchased_roadmaps`;
        let userPurchases: string[] | null = await getCache(accessCacheKey);
        
        if (!userPurchases) {
          const purchaseRes = await db.execute({
            sql: `SELECT roadmap_id FROM purchases WHERE user_id = ? AND status = 'completed'`,
            args: [userId]
          });
          userPurchases = purchaseRes.rows.map(r => r.roadmap_id as string);
          await setCache(accessCacheKey, userPurchases);
        }
        
        hasAccess = userPurchases.includes(roadmapData.id as string);
      }

      if (!hasAccess) {
        console.log(`[Freemium] User ${userId || 'anonymous'} has no access to premium roadmap. Showing teaser mode.`);
        
        // Teaser Mode: Return only top-level phase nodes (parent_id is null)
        const topLevelNodes = roadmapData.nodes.filter((n: any) => !n.parent_id);
        const topLevelNodeIds = topLevelNodes.map((n: any) => n.id);
        
        // Strip out everything else
        roadmapData = {
          ...roadmapData,
          nodes: topLevelNodes,
          edges: roadmapData.edges.filter((e: any) => topLevelNodeIds.includes(e.source_id) && topLevelNodeIds.includes(e.target_id)),
          resources: [],
          access_restricted: true,
          message: "This is a premium roadmap. Purchase to unlock full details and resources."
        };
      }
    }

    return roadmapData;
  }

  /**
   * Save a newly generated roadmap to the DB
   */
  static async saveRoadmapGraph(roadmapGraph: any) {
    const { id, title, slug, description, category_id, allow_data_training, nodes, edges } = roadmapGraph;
    
    const nodesCount = nodes ? nodes.length : 0;

    await db.execute({
      sql: `INSERT OR REPLACE INTO roadmaps_v2 (id, title, slug, description, category_id, is_published, allow_data_training, nodes_count, metadata)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      args: [id, title, slug, description, category_id || null, allow_data_training !== undefined ? allow_data_training : 1, nodesCount, JSON.stringify({})]
    });

    for (const node of nodes) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO nodes (id, roadmap_id, parent_id, title, type, description, order_index, allow_data_training, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          node.id, id, node.parent_id || null, node.title, node.type, 
          node.description || null, node.order_index || 0, node.allow_data_training !== undefined ? node.allow_data_training : 1, JSON.stringify(node.metadata || {})
        ]
      });
    }

    for (const edge of edges) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO edges (id, roadmap_id, source_id, target_id, type, label, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          edge.id, id, edge.source_id, edge.target_id, edge.type || 'smoothstep',
          edge.label || null, JSON.stringify(edge.metadata || {})
        ]
      });
    }

    // Invalidate cache
    await setCache(`roadmap_v2:${slug}`, roadmapGraph);
  }
}
