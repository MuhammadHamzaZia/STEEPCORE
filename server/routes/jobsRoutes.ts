import { Router } from 'express';
import { JobQueue } from '../services/jobQueue';
import { AIGenerator } from '../services/aiGenerator';
import { apiLimiter, strictLimiter } from '../middleware/security';
import { PromptGuard } from '../services/promptGuard';
import { requireAuth, requireOwnership, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/db';
import crypto from 'crypto';

const router = Router();

// 1. Submit a job for full generation
router.post('/generate', optionalAuth as any, apiLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "No API key configured" });

    // 1. LLM Security (Prompt Guard)
    const sanitizedRole = PromptGuard.sanitizeInput(role);

    const userId = req.user?.id || 'anonymous';
    const userRole = req.user?.role || 'user';
    const allowDataTraining = userRole === 'creator' ? 0 : 1;

    const logId = crypto.randomBytes(16).toString('hex');
    await db.execute({
      sql: 'INSERT INTO ai_generation_logs (id, user_id, prompt, status, allow_data_training) VALUES (?, ?, ?, ?, ?)',
      args: [logId, userId, sanitizedRole, 'pending', allowDataTraining]
    });

    const job = JobQueue.createJob('full_generation', { role: sanitizedRole, logId });
    
    // Start background worker
    AIGenerator.processFullGeneration(job.id, sanitizedRole, process.env.GEMINI_API_KEY, logId, allowDataTraining).catch(console.error);

    res.status(202).json({ jobId: job.id, status: job.status, message: "Generation queued asynchronously." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Submit a job for a delta update
router.post('/tweak', requireAuth as any, requireOwnership as any, strictLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { roadmapId, instruction } = req.body;
    if (!roadmapId || !instruction) return res.status(400).json({ error: "Missing roadmapId or instruction" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "No API key configured" });

    // 1. LLM Security (Prompt Guard)
    const sanitizedInstruction = PromptGuard.sanitizeInput(instruction);

    const userId = req.user!.id;
    const userRole = req.user!.role;
    const allowDataTraining = userRole === 'creator' ? 0 : 1;

    const logId = crypto.randomBytes(16).toString('hex');
    await db.execute({
      sql: 'INSERT INTO ai_generation_logs (id, user_id, prompt, status, allow_data_training) VALUES (?, ?, ?, ?, ?)',
      args: [logId, userId, sanitizedInstruction, 'pending', allowDataTraining]
    });

    const job = JobQueue.createJob('delta_update', { roadmapId, instruction: sanitizedInstruction, logId });
    
    // Start background worker
    AIGenerator.processDeltaUpdate(job.id, roadmapId, sanitizedInstruction, process.env.GEMINI_API_KEY, logId, allowDataTraining).catch(console.error);

    res.status(202).json({ jobId: job.id, status: job.status, message: "Delta update queued asynchronously." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Poll job status
router.get('/:jobId', (req, res) => {
  const job = JobQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

export default router;
