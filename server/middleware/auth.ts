import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { UserRole } from '../../src/types/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_example';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    isCreatorSubscriptionActive?: boolean;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Missing token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      isCreatorSubscriptionActive: decoded.isCreatorSubscriptionActive
    };
    
    // Optionally verify user still exists in DB
    const userResult = await db.execute({
      sql: 'SELECT id, role, is_creator_subscription_active FROM users WHERE id = ?',
      args: [decoded.id]
    });
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized. User not found.' });
    }
    
    req.user.role = userResult.rows[0].role as UserRole;
    req.user.isCreatorSubscriptionActive = Boolean(userResult.rows[0].is_creator_subscription_active);

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        role: decoded.role,
        isCreatorSubscriptionActive: decoded.isCreatorSubscriptionActive
      };
    }
  } catch (error) {
    // Ignore error for optional auth
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
};

export const requireCreator = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  
  if (req.user.role !== 'creator') {
    return res.status(403).json({ error: 'Forbidden. Creator role required.' });
  }
  
  if (!req.user.isCreatorSubscriptionActive) {
    return res.status(403).json({ error: 'Forbidden. Creator subscription has lapsed.' });
  }
  
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin role required.' });
  }
  next();
};

export const requireOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  let blueprintId = req.params.id || req.body.blueprintId || req.body.roadmapId || req.params.roadmapId || req.body.originalRoadmapId;
  const userRoadmapId = req.params.userRoadmapId || req.body.userRoadmapId;

  try {
    if (userRoadmapId && !blueprintId) {
      // Lookup the original roadmap ID from the user roadmap
      const urResult = await db.execute({
        sql: 'SELECT original_roadmap_id FROM user_roadmaps WHERE id = ? AND user_id = ?',
        args: [userRoadmapId, req.user.id]
      });
      if (urResult.rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden. User roadmap not found or not owned by you.' });
      }
      blueprintId = urResult.rows[0].original_roadmap_id as string;
    }

    if (!blueprintId) {
      return res.status(400).json({ error: 'Bad Request. Blueprint ID or UserRoadmap ID is required for ownership check.' });
    }

    const roadmapResult = await db.execute({
      sql: 'SELECT is_premium, price FROM roadmaps_v2 WHERE id = ?',
      args: [blueprintId]
    });

    if (roadmapResult.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found. Blueprint not found.' });
    }

    const isPremium = Boolean(roadmapResult.rows[0].is_premium);

    if (!isPremium) {
      return next(); // Free access
    }

    // Check purchases table
    const purchaseResult = await db.execute({
      sql: 'SELECT id FROM purchases WHERE user_id = ? AND roadmap_id = ? AND status = ?',
      args: [req.user.id, blueprintId, 'completed']
    });

    if (purchaseResult.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. You do not own this blueprint.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during ownership check.' });
  }
};

