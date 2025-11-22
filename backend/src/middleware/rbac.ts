import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Role-based access control middleware
 * Checks if the authenticated user has one of the required roles
 */
export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated (should be set by authenticate middleware)
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'غير مصرح - يجب تسجيل الدخول أولاً',
        });
        return;
      }

      // Check if user has one of the required roles
      if (!roles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.user._id} with role ${req.user.role}`);
        res.status(403).json({
          success: false,
          message: 'غير مصرح - ليس لديك الصلاحيات الكافية',
        });
        return;
      }

      // User has required role, proceed
      next();
    } catch (error: any) {
      logger.error('Error in role authorization:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات',
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to allow only admins
 */
export const adminOnly = authorizeRoles(['admin']);

/**
 * Middleware to allow admins and commercials
 */
export const adminOrCommercial = authorizeRoles(['admin', 'commercial']);

/**
 * Middleware to allow admins and store users
 */
export const adminOrStore = authorizeRoles(['admin', 'store']);
