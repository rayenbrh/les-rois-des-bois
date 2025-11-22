import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * GET /api/analytics/sales
 * Get sales analytics (admin and commercial only)
 */
router.get(
  '/sales',
  authorizeRoles(['admin', 'commercial']),
  analyticsController.getSalesAnalytics
);

/**
 * GET /api/analytics/dashboard
 * Get dashboard statistics for current user
 */
router.get('/dashboard', analyticsController.getDashboardStats);

export default router;
