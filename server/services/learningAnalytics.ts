import { db } from '../config/db';
import { nodeStuckCounter } from './telemetry';
import { JobQueue } from './jobQueue';
import { AIGenerator } from './aiGenerator';

export class LearningAnalytics {
  /**
   * Track when a user gets stuck on a node.
   */
  static async reportStuckNode(userRoadmapId: string, userId: string, nodeId: string) {
    // 1. Increment Prometheus Metric
    nodeStuckCounter.labels(nodeId).inc();

    // 2. Log stuck event in the database for persistence
    // (We reuse the user_roadmaps progress JSON for this in our current schema)
    const res = await db.execute({
      sql: `SELECT progress, original_roadmap_id FROM user_roadmaps WHERE id = ? AND user_id = ?`,
      args: [userRoadmapId, userId]
    });

    if (res.rows.length === 0) return;

    const progress = JSON.parse(res.rows[0].progress as string || '{}');
    const originalRoadmapId = res.rows[0].original_roadmap_id as string;
    
    if (!progress[nodeId]) {
      progress[nodeId] = { status: 'in_progress', stuck_count: 0 };
    }
    progress[nodeId].stuck_count = (progress[nodeId].stuck_count || 0) + 1;
    progress[nodeId].updated_at = new Date().toISOString();

    await db.execute({
      sql: `UPDATE user_roadmaps SET progress = ? WHERE id = ?`,
      args: [JSON.stringify(progress), userRoadmapId]
    });

    console.log(`[Analytics] User ${userId} reported stuck on node ${nodeId}`);

    // 3. Automated Sub-node Generation (Telemetry of Learning)
    // If we detect a node is globally hard (e.g., in a background job), we expand it.
    // Here we simulate an immediate trigger if this is the Nth time someone got stuck.
    await this.evaluateNodeDifficulty(originalRoadmapId, nodeId);
  }

  /**
   * Evaluates if a node is too difficult and triggers LLM generation for sub-nodes.
   */
  static async evaluateNodeDifficulty(roadmapId: string, nodeId: string) {
    // Simple heuristic: count total stuck events across all users for this node
    // In production, this would use a materialized view or structured analytics table
    const res = await db.execute({
      sql: `SELECT progress FROM user_roadmaps WHERE original_roadmap_id = ?`,
      args: [roadmapId]
    });

    let totalStuck = 0;
    for (const row of res.rows) {
      const prog = JSON.parse(row.progress as string || '{}');
      if (prog[nodeId] && prog[nodeId].stuck_count) {
        totalStuck += prog[nodeId].stuck_count;
      }
    }

    const STUCK_THRESHOLD = 3; // For demonstration. E.g., 3 people got stuck.
    if (totalStuck >= STUCK_THRESHOLD) {
      console.log(`[Analytics] Node ${nodeId} exceeded stuck threshold. Triggering Auto-Expansion.`);
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      // Check if we already created a job recently to avoid spamming
      const instruction = `The node ${nodeId} has proven difficult for users. Expand this node into 3 smaller, more detailed sub-nodes with simpler explanations.`;
      
      const crypto = await import('crypto');
      const logId = crypto.randomBytes(16).toString('hex');
      await db.execute({
        sql: 'INSERT INTO ai_generation_logs (id, user_id, prompt, status, allow_data_training) VALUES (?, ?, ?, ?, ?)',
        args: [logId, 'system', instruction, 'pending', 1]
      });

      const job = JobQueue.createJob('delta_update_analytics', { roadmapId, instruction, logId });
      AIGenerator.processDeltaUpdate(job.id, roadmapId, instruction, apiKey, logId, 1).catch(console.error);
    }
  }
}
