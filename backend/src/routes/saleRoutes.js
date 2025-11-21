import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  deleteSale
} from '../controllers/saleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('pos', 'admin'), createSale);
router.get('/', protect, authorize('pos', 'admin'), getSales);
router.get('/:id', protect, authorize('pos', 'admin'), getSaleById);
router.delete('/:id', protect, authorize('admin'), deleteSale);

export default router;
