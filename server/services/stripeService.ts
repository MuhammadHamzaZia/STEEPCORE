import Stripe from 'stripe';
import { db } from '../config/db';
import { randomUUID } from 'crypto';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key'; // Fallback for dev without keys
    stripeClient = new Stripe(key, { apiVersion: '2026-06-24.dahlia' as any });
  }
  return stripeClient;
}

export class StripeService {
  /**
   * Creates a PaymentIntent for purchasing a premium roadmap
   */
  static async createPaymentIntent(userId: string, roadmapId: string) {
    const roadmapRes = await db.execute({
      sql: `SELECT title, price, is_premium, creator_id FROM roadmaps_v2 WHERE id = ?`,
      args: [roadmapId]
    });

    if (roadmapRes.rows.length === 0) throw new Error("Roadmap not found");
    const roadmap = roadmapRes.rows[0];

    if (!roadmap.is_premium) throw new Error("Roadmap is free");
    if (!roadmap.creator_id) throw new Error("Roadmap creator not found for payout");

    const price = roadmap.price as number;
    const amountCents = Math.round(price * 100);
    const idempotencyKey = `pi_create_${userId}_${roadmapId}_${Date.now()}`;

    // Create PaymentIntent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        roadmap_id: roadmapId,
        user_id: userId,
        creator_id: roadmap.creator_id as string
      }
    }, { idempotencyKey });

    const purchaseId = randomUUID();
    // Record pending transaction with idempotency key
    await db.execute({
      sql: `INSERT INTO purchases (id, user_id, roadmap_id, stripe_payment_intent_id, idempotency_key, amount_paid, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      args: [purchaseId, userId, roadmapId, paymentIntent.id, idempotencyKey, price]
    });

    return paymentIntent;
  }

  /**
   * Handles payment_intent.succeeded
   */
  static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { user_id, roadmap_id, creator_id } = paymentIntent.metadata || {};
    if (!user_id || !roadmap_id || !creator_id) {
      console.error("[Stripe Webhook] Missing metadata in payment_intent", paymentIntent.id);
      return;
    }

    const amountPaid = paymentIntent.amount_received / 100;
    const platformFeePercent = 0.20;
    const creatorEarnings = amountPaid * (1 - platformFeePercent);

    // Atomic transaction using batch
    await db.batch([
      // 1. Mark purchase as completed
      {
        sql: `UPDATE purchases SET status = 'completed', stripe_transaction_id = ? WHERE stripe_payment_intent_id = ?`,
        args: [paymentIntent.id, paymentIntent.id]
      },
      // 2. Increment creator's wallet balance
      {
        sql: `UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?`,
        args: [creatorEarnings, creator_id]
      },
      // 3. Initialize UserProgress (user_roadmaps) for the buyer at 0%
      {
        sql: `INSERT INTO user_roadmaps (id, user_id, original_roadmap_id, progress, custom_nodes, custom_edges) 
              VALUES (?, ?, ?, '{}', '[]', '[]')`,
        args: [randomUUID(), user_id, roadmap_id]
      }
    ], 'write');
    
    // Invalidate Redis Cache (if used)
    const { deleteCache } = await import('../config/cache');
    await deleteCache(`user:${user_id}:purchased_roadmaps`);
  }

  /**
   * Triggers a withdrawal to Creator's Stripe account
   */
  static async triggerCreatorPayout(creatorId: string, withdrawalAmount: number) {
    const userRes = await db.execute({
      sql: `SELECT wallet_balance, stripe_account_id FROM users WHERE id = ?`,
      args: [creatorId]
    });

    if (userRes.rows.length === 0) throw new Error("Creator not found");
    const user = userRes.rows[0];

    if (!user.stripe_account_id) throw new Error("Stripe account not linked");
    const balance = user.wallet_balance as number;
    if (balance < withdrawalAmount) throw new Error("Insufficient wallet balance");

    const payoutId = randomUUID();

    // Create payout record
    await db.execute({
      sql: `INSERT INTO creator_payouts (id, creator_id, amount, status) VALUES (?, ?, ?, 'processing')`,
      args: [payoutId, creatorId, withdrawalAmount]
    });

    try {
      // Trigger Stripe Connect Transfer
      const transfer = await getStripe().transfers.create({
        amount: Math.round(withdrawalAmount * 100),
        currency: 'usd',
        destination: user.stripe_account_id as string,
        metadata: {
          payout_id: payoutId,
          creator_id: creatorId
        }
      });

      // Update transfer ID
      await db.execute({
        sql: `UPDATE creator_payouts SET stripe_transfer_id = ? WHERE id = ?`,
        args: [transfer.id, payoutId]
      });

      return { payoutId, status: 'processing' };
    } catch (error) {
      // Mark as failed if transfer throws
      await db.execute({
        sql: `UPDATE creator_payouts SET status = 'failed' WHERE id = ?`,
        args: [payoutId]
      });
      throw error;
    }
  }

  /**
   * Handles transfer.created or similar webhook to confirm the transfer
   */
  static async handleTransferCompleted(transfer: Stripe.Transfer) {
    const { payout_id, creator_id } = transfer.metadata || {};
    if (!payout_id || !creator_id) return;

    const amount = transfer.amount / 100;

    // Deduct from wallet balance and mark completed
    await db.batch([
      {
        sql: `UPDATE creator_payouts SET status = 'completed' WHERE id = ?`,
        args: [payout_id]
      },
      {
        sql: `UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?`,
        args: [amount, creator_id]
      }
    ], 'write');
  }
}
