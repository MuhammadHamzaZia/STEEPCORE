import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { UserRole } from '../../src/types/schema';
import crypto from 'crypto';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_example';

// Generate a random ID
const generateId = () => crypto.randomBytes(16).toString('hex');

const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: z.enum(['user', 'creator', 'admin']).optional(),
  })
});

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  })
});

router.post('/register', validateRequest(RegisterSchema), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const requestedRole = role === 'creator' || role === 'admin' ? role : 'user';

    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = generateId();
    // In production, use bcrypt to hash the password!
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const isCreatorSubActive = requestedRole === 'creator' ? 1 : 0; // default active for testing

    await db.execute({
      sql: 'INSERT INTO users (id, email, password_hash, role, is_creator_subscription_active) VALUES (?, ?, ?, ?, ?)',
      args: [userId, email, passwordHash, requestedRole, isCreatorSubActive]
    });

    const token = jwt.sign(
      { id: userId, role: requestedRole, isCreatorSubscriptionActive: Boolean(isCreatorSubActive) },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user: {
        id: userId,
        email,
        role: requestedRole,
        isCreatorSubscriptionActive: Boolean(isCreatorSubActive)
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', validateRequest(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await db.execute({
      sql: 'SELECT id, role, is_creator_subscription_active, is_archived FROM users WHERE email = ? AND password_hash = ?',
      args: [email, passwordHash]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_archived) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    const token = jwt.sign(
      { 
        id: user.id as string, 
        role: user.role as UserRole, 
        isCreatorSubscriptionActive: Boolean(user.is_creator_subscription_active) 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email,
        role: user.role,
        isCreatorSubscriptionActive: Boolean(user.is_creator_subscription_active)
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const result = await db.execute({
      sql: 'SELECT id, email, role, is_creator_subscription_active FROM users WHERE id = ?',
      args: [decoded.id]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        isCreatorSubscriptionActive: Boolean(result.rows[0].is_creator_subscription_active)
      }
    });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/delete-account', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const anonymizedEmail = `deleted_${userId}@anonymized.local`;

    // Soft delete the user and anonymize PII
    await db.execute({
      sql: "UPDATE users SET is_archived = 1, email = ?, password_hash = 'DELETED', stripe_account_id = NULL, deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [anonymizedEmail, userId]
    });

    // Also soft delete their published roadmaps
    await db.execute({
      sql: 'UPDATE roadmaps_v2 SET is_archived = 1, deleted_at = CURRENT_TIMESTAMP WHERE creator_id = ?',
      args: [userId]
    });

    res.clearCookie('token');
    res.json({ success: true, message: "Account deleted and PII anonymized successfully." });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
