import { Router } from 'express';
import { RoadmapService } from '../services/roadmapService';
import { apiLimiter, aiLimiter } from '../middleware/security';
import { requireAuth, requireCreator, requireOwnership, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/db';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import sanitizeHtml from 'sanitize-html';

const router = Router();

const PublishSchema = z.object({
  body: z.object({
    roadmapId: z.string().uuid(),
    price: z.number().min(0).optional(),
  })
});

const RemixSchema = z.object({
  body: z.object({
    originalRoadmapId: z.string().uuid(),
  })
});

const UpdatePricingSchema = z.object({
  body: z.object({
    roadmapId: z.string().uuid(),
    price: z.number().min(0),
  })
});

// Generate an AI roadmap (Apply AI limiter and Zod validation)
const GenerateSchema = z.object({
  body: z.object({
    topic: z.string().min(3).max(100),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  })
});

router.post('/generate', requireAuth as any, aiLimiter, validateRequest(GenerateSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { topic, level } = req.body;
    
    // Sanitize input
    const sanitizedTopic = sanitizeHtml(topic, { allowedTags: [], allowedAttributes: {} });

    // Call AI generation service here... (dummy implementation for now)
    res.json({ message: "Generation started", topic: sanitizedTopic, level });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get an advanced roadmap by slug (Public/Freemium)
router.get('/v2/:slug', optionalAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    const roadmap = await RoadmapService.getRoadmapBySlug(slug.toLowerCase().trim(), userId);
    
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    res.json(roadmap);
  } catch (error: any) {
    console.error("Error fetching v2 roadmap:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Publish a roadmap (Creators only)
router.post('/publish', requireCreator as any, validateRequest(PublishSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { roadmapId, price } = req.body;
    const creatorId = req.user!.id;
    if (!roadmapId) {
      return res.status(400).json({ error: 'roadmapId is required' });
    }

    // 1. Sanity check: Does it have > 0 nodes?
    const nodesCountRes = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM nodes WHERE roadmap_id = ?',
      args: [roadmapId]
    });
    const nodeCount = nodesCountRes.rows[0].count as number;
    if (nodeCount === 0) {
      return res.status(400).json({ error: 'Cannot publish a roadmap with 0 nodes.' });
    }

    // 2. Is the price valid?
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Invalid price provided.' });
    }
    const finalPrice = price || 0;
    const isPremium = finalPrice > 0 ? 1 : 0;

    // 3. Is the creator's subscription active?
    const userRes = await db.execute({
      sql: 'SELECT is_creator_subscription_active FROM users WHERE id = ?',
      args: [creatorId]
    });
    if (!userRes.rows[0].is_creator_subscription_active) {
      return res.status(403).json({ error: 'Active creator subscription required to publish.' });
    }

    const result = await db.execute({
      sql: "UPDATE roadmaps_v2 SET is_published = 1, price = ?, is_premium = ?, creator_id = ? WHERE id = ?",
      args: [finalPrice, isPremium, creatorId, roadmapId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Roadmap not found.' });
    }

    // Cache Invalidation
    const { deleteCache } = await import('../config/cache');
    await deleteCache('public_catalog:trending');
    await deleteCache('public_catalog:all');

    res.json({ message: `Roadmap ${roadmapId} published successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remix a roadmap
router.post('/remix', requireAuth as any, validateRequest(RemixSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { originalRoadmapId } = req.body;
    const userId = req.user!.id;
    
    if (!originalRoadmapId) {
      return res.status(400).json({ error: 'originalRoadmapId is required' });
    }

    // Fetch original roadmap
    const roadmapRes = await db.execute({
      sql: 'SELECT * FROM roadmaps_v2 WHERE id = ?',
      args: [originalRoadmapId]
    });

    if (roadmapRes.rows.length === 0) {
      return res.status(404).json({ error: 'Original roadmap not found' });
    }

    const originalRoadmap = roadmapRes.rows[0];

    // Check strict data training flag
    const allowDataTraining = originalRoadmap.allow_data_training === 0 ? 0 : 1;

    const newRoadmapId = randomUUID();
    const newSlug = `${originalRoadmap.slug}-remix-${newRoadmapId.slice(0, 8)}`;

    await db.execute({
      sql: `INSERT INTO roadmaps_v2 (id, title, slug, description, category_id, is_published, is_premium, price, creator_id, original_roadmap_id, source, allow_data_training, nodes_count, metadata)
            VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?, 'remixed', ?, ?, ?)`,
      args: [
        newRoadmapId,
        `Remix of ${originalRoadmap.title}`,
        newSlug,
        originalRoadmap.description,
        originalRoadmap.category_id,
        userId,
        originalRoadmapId,
        allowDataTraining,
        originalRoadmap.nodes_count || 0,
        originalRoadmap.metadata
      ]
    });

    // Clone Nodes
    const nodesRes = await db.execute({
      sql: 'SELECT * FROM nodes WHERE roadmap_id = ?',
      args: [originalRoadmapId]
    });

    // Map old node ids to new node ids
    const nodeIdMap: Record<string, string> = {};
    for (const node of nodesRes.rows) {
      nodeIdMap[node.id as string] = randomUUID();
    }

    for (const node of nodesRes.rows) {
      const newNodeId = nodeIdMap[node.id as string];
      const newParentId = node.parent_id ? nodeIdMap[node.parent_id as string] : null;

      await db.execute({
        sql: `INSERT INTO nodes (id, roadmap_id, parent_id, title, type, description, order_index, allow_data_training, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newNodeId,
          newRoadmapId,
          newParentId,
          node.title,
          node.type,
          node.description,
          node.order_index,
          allowDataTraining, // Inherit strictest flag
          node.metadata
        ]
      });
    }

    // Clone Edges
    const edgesRes = await db.execute({
      sql: 'SELECT * FROM edges WHERE roadmap_id = ?',
      args: [originalRoadmapId]
    });

    for (const edge of edgesRes.rows) {
      const newEdgeId = randomUUID();
      const newSourceId = nodeIdMap[edge.source_id as string];
      const newTargetId = nodeIdMap[edge.target_id as string];

      if (newSourceId && newTargetId) {
        await db.execute({
          sql: `INSERT INTO edges (id, roadmap_id, source_id, target_id, type)
                VALUES (?, ?, ?, ?, ?)`,
          args: [newEdgeId, newRoadmapId, newSourceId, newTargetId, edge.type]
        });
      }
    }

    res.json({ message: 'Roadmap remixed successfully', roadmapId: newRoadmapId, slug: newSlug });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update pricing (Creators only)
router.post('/update-pricing', requireCreator as any, validateRequest(UpdatePricingSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { roadmapId, price } = req.body;
    const creatorId = req.user!.id;
    if (!roadmapId || price === undefined) {
      return res.status(400).json({ error: 'roadmapId and price are required' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Invalid price provided.' });
    }

    const isPremium = price > 0 ? 1 : 0;

    const result = await db.execute({
      sql: "UPDATE roadmaps_v2 SET price = ?, is_premium = ? WHERE id = ? AND creator_id = ?",
      args: [price, isPremium, roadmapId, creatorId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Roadmap not found or you are not the creator.' });
    }

    // Cache Invalidation
    const { deleteCache } = await import('../config/cache');
    await deleteCache('public_catalog:trending');
    await deleteCache('public_catalog:all');

    res.json({ message: `Roadmap ${roadmapId} pricing updated successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const ArchiveSchema = z.object({
  body: z.object({
    roadmapId: z.string().uuid(),
  })
});

// Archive a roadmap
router.post('/archive', requireAuth as any, validateRequest(ArchiveSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { roadmapId } = req.body;
    const userId = req.user!.id;

    const result = await db.execute({
      sql: 'UPDATE roadmaps_v2 SET is_archived = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND creator_id = ?',
      args: [roadmapId, userId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Roadmap not found or you are not the owner' });
    }

    // Cache Invalidation
    const { deleteCache } = await import('../config/cache');
    await deleteCache('public_catalog:trending');
    await deleteCache('public_catalog:all');

    res.json({ message: 'Roadmap archived successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
