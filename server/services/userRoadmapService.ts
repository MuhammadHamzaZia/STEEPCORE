import { db } from '../config/db';
import { randomUUID } from 'crypto';

export class UserRoadmapService {
  /**
   * Fork a public roadmap to a user's personal isolated space.
   */
  static async forkRoadmap(userId: string, originalRoadmapId: string) {
    // 1. Verify original roadmap exists and is published
    const originalRes = await db.execute({
      sql: `SELECT id FROM roadmaps_v2 WHERE id = ? AND is_published = 1`,
      args: [originalRoadmapId]
    });

    if (originalRes.rows.length === 0) {
      throw new Error("Original roadmap not found or not published.");
    }

    // 2. Create isolated user roadmap
    const userRoadmapId = randomUUID();
    
    await db.execute({
      sql: `INSERT INTO user_roadmaps (id, user_id, original_roadmap_id, progress, custom_nodes, custom_edges)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        userRoadmapId,
        userId,
        originalRoadmapId,
        JSON.stringify({}), // Empty progress
        JSON.stringify([]), // No custom nodes yet
        JSON.stringify([])  // No custom edges yet
      ]
    });

    return { id: userRoadmapId, message: "Roadmap forked successfully." };
  }

  /**
   * Update progress for a specific node in a user's isolated roadmap.
   */
  static async updateProgress(userRoadmapId: string, userId: string, nodeId: string, status: 'completed' | 'in_progress' | 'not_started') {
    // 1. Fetch current progress and original_roadmap_id
    const res = await db.execute({
      sql: `SELECT progress, original_roadmap_id FROM user_roadmaps WHERE id = ? AND user_id = ?`,
      args: [userRoadmapId, userId]
    });

    if (res.rows.length === 0) {
      throw new Error("User roadmap not found or you don't own it.");
    }

    const { original_roadmap_id } = res.rows[0];

    // 2. Backend Validation: Check if nodeId belongs to the original roadmap or is a custom node
    const nodeRes = await db.execute({
      sql: `SELECT id FROM nodes WHERE id = ? AND roadmap_id = ?`,
      args: [nodeId, original_roadmap_id]
    });

    // We also need to check custom nodes if it wasn't found in global nodes
    if (nodeRes.rows.length === 0) {
      const customNodeRes = await db.execute({
        sql: `SELECT custom_nodes FROM user_roadmaps WHERE id = ? AND user_id = ?`,
        args: [userRoadmapId, userId]
      });
      const customNodes = JSON.parse(customNodeRes.rows[0]?.custom_nodes as string || '[]');
      const isCustomNode = customNodes.some((n: any) => n.id === nodeId);
      
      if (!isCustomNode) {
        throw new Error("Node does not belong to this roadmap.");
      }
    }

    const progress = JSON.parse(res.rows[0].progress as string || '{}');
    progress[nodeId] = { status, updated_at: new Date().toISOString() }; // UTC timestamp from server

    // 3. Percentage Recalculation
    // Get nodesCount from original roadmap
    const roadmapRes = await db.execute({
      sql: `SELECT nodes_count FROM roadmaps_v2 WHERE id = ?`,
      args: [original_roadmap_id]
    });
    
    let totalNodesCount = roadmapRes.rows[0]?.nodes_count as number || 1; // Fallback to 1 to avoid division by zero
    
    // Add custom nodes count
    const customNodeRes = await db.execute({
      sql: `SELECT custom_nodes FROM user_roadmaps WHERE id = ?`,
      args: [userRoadmapId]
    });
    const customNodesCount = JSON.parse(customNodeRes.rows[0]?.custom_nodes as string || '[]').length;
    
    totalNodesCount += customNodesCount;

    // Calculate completed nodes
    let completedNodesCount = 0;
    for (const key in progress) {
      if (progress[key].status === 'completed') {
        completedNodesCount++;
      }
    }

    let percentage = (completedNodesCount / totalNodesCount) * 100;
    if (percentage > 100) percentage = 100;

    // 4. Save progress back and update last_accessed with server timestamp
    await db.execute({
      sql: `UPDATE user_roadmaps SET progress = ?, percentage = ?, last_accessed = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [JSON.stringify(progress), percentage.toFixed(2), userRoadmapId]
    });

    return { message: "Progress updated.", percentage: percentage.toFixed(2) };
  }

  /**
   * Add a custom node to the user's isolated roadmap.
   * This guarantees data isolation: global roadmaps are untouched.
   */
  static async addCustomNode(userRoadmapId: string, userId: string, nodeData: any) {
    const res = await db.execute({
      sql: `SELECT custom_nodes FROM user_roadmaps WHERE id = ? AND user_id = ?`,
      args: [userRoadmapId, userId]
    });

    if (res.rows.length === 0) {
      throw new Error("User roadmap not found.");
    }

    const customNodes = JSON.parse(res.rows[0].custom_nodes as string || '[]');
    customNodes.push({
      id: `custom-node-${randomUUID()}`,
      ...nodeData,
      created_at: new Date().toISOString()
    });

    await db.execute({
      sql: `UPDATE user_roadmaps SET custom_nodes = ?, last_accessed = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [JSON.stringify(customNodes), userRoadmapId]
    });

    return { message: "Custom node added." };
  }
}
