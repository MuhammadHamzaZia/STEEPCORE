import { Router } from 'express';
import { StripeService, getStripe } from '../services/stripeService';
import { requireAuth, requireCreator, AuthenticatedRequest } from '../middleware/auth';
import express from 'express';
import { checkoutLimiter } from '../middleware/security';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const router = Router();

const CreateIntentSchema = z.object({
  body: z.object({
    roadmapId: z.string().uuid(),
  })
});

// Endpoint for frontend to create a payment intent
router.post('/create-intent', requireAuth as any, checkoutLimiter, validateRequest(CreateIntentSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { roadmapId } = req.body;
    const userId = req.user!.id;

    const paymentIntent = await StripeService.createPaymentIntent(userId, roadmapId);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PayoutSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  })
});

// Endpoint for creators to trigger a payout withdrawal
router.post('/payout', requireCreator as any, checkoutLimiter, validateRequest(PayoutSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { amount } = req.body;
    const creatorId = req.user!.id;

    const result = await StripeService.triggerCreatorPayout(creatorId, amount);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook endpoint. Uses express.raw to verify signature.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (endpointSecret && sig) {
    try {
      event = getStripe().webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // For local dev without webhook secret verification
    event = JSON.parse(req.body.toString());
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await StripeService.handlePaymentSucceeded(paymentIntent);
        break;
      case 'transfer.created':
        const transfer = event.data.object;
        await StripeService.handleTransferCompleted(transfer);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send();
  } catch (error) {
    console.error("[Stripe Webhook Error]", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
