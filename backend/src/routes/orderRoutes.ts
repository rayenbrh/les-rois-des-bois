import { Router } from 'express';
import { orderController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';
import { orderValidations } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate); // All routes require authentication

router.post('/', orderValidations.create, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', authorize(UserRole.ADMIN, UserRole.COMMERCIAL), orderValidations.updateStatus, orderController.updateOrderStatus);
router.post('/:id/generate-invoice', authorize(UserRole.ADMIN, UserRole.COMMERCIAL), orderController.generateInvoice);

export default router;
