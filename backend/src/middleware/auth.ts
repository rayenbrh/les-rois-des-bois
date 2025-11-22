import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { AuthRequest, UserRole } from '../types';
import { User } from '../models';
import logger from '../utils/logger';

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = authService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    try {
      const decoded = authService.verifyAccessToken(token);

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
      return;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = authService.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      try {
        const decoded = authService.verifyAccessToken(token);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
      } catch (error) {
        // Invalid token but continue anyway
        logger.warn('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is active
 */
export const checkActiveUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const user = await User.findById(req.user.id).select('isActive');

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking user status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * Check if commercial user can access client data
 */
export const checkCommercialAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Admin has access to everything
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Commercial can only access their assigned clients
    if (req.user.role === UserRole.COMMERCIAL) {
      const clientId = req.params.clientId || req.body.clientId || req.query.clientId;

      if (!clientId) {
        next();
        return;
      }

      const client = await User.findById(clientId).select('assignedCommercial');

      if (!client || client.assignedCommercial?.toString() !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Client not assigned to you.',
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Error checking commercial access:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};
