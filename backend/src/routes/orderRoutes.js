import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  markOrderPaid,
  getUnpaidOrders,
  deleteOrder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('client'), createOrder);
router.get('/', protect, getOrders);
router.get('/unpaid', protect, getUnpaidOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, authorize('admin', 'commercial'), updateOrderStatus);
router.patch('/:id/paid', protect, authorize('admin', 'commercial'), markOrderPaid);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

export default router;
