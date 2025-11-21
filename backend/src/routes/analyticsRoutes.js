import express from 'express';
import {
  getDashboardAnalytics,
  getCommercialAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardAnalytics);
router.get('/commercial', protect, authorize('commercial'), getCommercialAnalytics);

export default router;
