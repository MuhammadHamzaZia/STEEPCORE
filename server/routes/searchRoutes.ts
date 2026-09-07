import { Router } from 'express';
import { SearchEngine } from '../services/searchEngine';
import { apiLimiter } from '../middleware/security';
import { getCache, setCache } from '../config/cache';
import { db } from '../config/db';

const router = Router();

// Get public catalog
router.get('/catalog', apiLimiter, async (req, res) => {
  try {
    const cacheKey = 'public_catalog:all';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const roadmaps = await db.execute({
      sql: 'SELECT id, title, slug, description, price, is_premium, creator_id FROM roadmaps_v2 WHERE is_published = 1 AND is_archived = 0 ORDER BY created_at DESC',
      args: []
    });

    await setCache(cacheKey, roadmaps.rows, 3600); // 1 hour
    res.json(roadmaps.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending catalog
router.get('/trending', apiLimiter, async (req, res) => {
  try {
    const cacheKey = 'public_catalog:trending';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Simplified trending logic: Just published + premium ones first or limited to 10
    const roadmaps = await db.execute({
      sql: 'SELECT id, title, slug, description, price, is_premium, creator_id FROM roadmaps_v2 WHERE is_published = 1 AND is_archived = 0 ORDER BY is_premium DESC, created_at DESC LIMIT 10',
      args: []
    });

    await setCache(cacheKey, roadmaps.rows, 3600); // 1 hour
    res.json(roadmaps.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Semantic Search (Requires LLM embeddings)
router.get('/semantic', apiLimiter, async (req, res) => {
  const { q, limit } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "No API key configured for embeddings" });
  }

  try {
    const results = await SearchEngine.semanticSearch(
      q, 
      process.env.GEMINI_API_KEY, 
      limit ? parseInt(limit as string) : 5
    );
    res.json({ results });
  } catch (error: any) {
    console.error("Semantic search error:", error);
    res.status(500).json({ error: "Failed to perform semantic search" });
  }
});

// 2. Autocomplete (Fast, no LLM required)
router.get('/autocomplete', apiLimiter, async (req, res) => {
  const { q, limit } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const results = await SearchEngine.autocomplete(q, limit ? parseInt(limit as string) : 5);
    res.json({ results });
  } catch (error: any) {
    console.error("Autocomplete search error:", error);
    res.status(500).json({ error: "Failed to perform autocomplete search" });
  }
});

export default router;
