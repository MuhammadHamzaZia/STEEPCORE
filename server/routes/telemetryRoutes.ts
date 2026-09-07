import { Router } from 'express';
import { Telemetry } from '../services/telemetry';

const router = Router();

// Expose Prometheus metrics
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', Telemetry.getContentType());
    res.end(await Telemetry.getMetrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

export default router;
