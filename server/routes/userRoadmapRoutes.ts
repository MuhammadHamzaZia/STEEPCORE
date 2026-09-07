import { Router } from 'express';
import { UserRoadmapService } from '../services/userRoadmapService';
import { requireAuth, requireOwnership, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import sanitizeHtml from 'sanitize-html';

const router = Router();

// Require auth for all user roadmap routes
router.use(requireAuth as any);

const ForkSchema = z.object({
  body: z.object({
    originalRoadmapId: z.string().uuid(),
  })
});

router.post('/fork', requireOwnership as any, validateRequest(ForkSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { originalRoadmapId } = req.body;
    const userId = req.user!.id;
    
    const result = await UserRoadmapService.forkRoadmap(userId, originalRoadmapId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const ProgressSchema = z.object({
  body: z.object({
    nodeId: z.string(), // can be uuid or custom string
    status: z.enum(['completed', 'in_progress', 'not_started']),
  })
});

router.post('/:userRoadmapId/progress', requireOwnership as any, validateRequest(ProgressSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { nodeId, status } = req.body;
    const userId = req.user!.id;

    const result = await UserRoadmapService.updateProgress(req.params.userRoadmapId, userId, nodeId, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const StuckSchema = z.object({
  body: z.object({
    nodeId: z.string(),
  })
});

router.post('/:userRoadmapId/report-stuck', requireOwnership as any, validateRequest(StuckSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { nodeId } = req.body;
    const userId = req.user!.id;

    const { LearningAnalytics } = await import('../services/learningAnalytics');
    await LearningAnalytics.reportStuckNode(req.params.userRoadmapId, userId, nodeId);
    res.json({ message: "Stuck report logged successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const CustomNodeSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200),
    type: z.string(),
    description: z.string().optional(),
    parent_id: z.string().nullable().optional(),
  })
});

router.post('/:userRoadmapId/custom-nodes', requireOwnership as any, validateRequest(CustomNodeSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const nodeData = req.body;
    const userId = req.user!.id;
    
    // Input Sanitization for HTML/XSS
    const sanitizedTitle = sanitizeHtml(nodeData.title, { allowedTags: [], allowedAttributes: {} }); // Strip all HTML for title
    const sanitizedDescription = nodeData.description 
      ? sanitizeHtml(nodeData.description) // Default sanitize-html settings allow safe formatting but strip dangerous tags
      : undefined;

    const result = await UserRoadmapService.addCustomNode(req.params.userRoadmapId, userId, {
      ...nodeData,
      title: sanitizedTitle,
      description: sanitizedDescription
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
