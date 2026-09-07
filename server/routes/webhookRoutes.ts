import { Router } from 'express';
import { IntegrationHub } from '../integrations/IntegrationHub';
import { db } from '../config/db';

const router = Router();

// Endpoint for external platforms (e.g. Udemy, YouTube, custom webhooks)
// to notify us of content updates (e.g. course price change, video taken down)
router.post('/:platform', async (req, res) => {
  const { platform } = req.params;
  const payload = req.body;
  
  // Basic security: In production, verify HMAC signatures (e.g., GitHub Webhooks)
  const signature = req.headers['x-hub-signature'];
  
  const adapter = IntegrationHub.getAdapter(platform);
  if (!adapter) {
    return res.status(400).json({ error: `Unsupported platform webhook: ${platform}` });
  }

  console.log(`[Webhook] Received update from ${platform}. Processing...`);

  try {
    // Determine the resource ID from the webhook payload based on the platform format
    // Mocking extraction here
    const externalResourceId = payload?.id || payload?.video_id || payload?.course_id;
    
    if (externalResourceId) {
      // 1. Fetch updated details using the adapter
      const updatedDetails = await adapter.fetchDetails(externalResourceId);
      
      if (updatedDetails) {
        // 2. Find matching resources in our database and update them
        // This is a naive URL matching for demonstration. A robust system would store the external ID in the DB metadata.
        await db.execute({
          sql: `UPDATE resources 
                SET title = ? 
                WHERE url LIKE ?`,
          args: [updatedDetails.title, `%${externalResourceId}%`]
        });
        console.log(`[Webhook] Successfully updated resource related to ${externalResourceId}`);
      }
    }

    // Acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing ${platform} payload:`, error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
