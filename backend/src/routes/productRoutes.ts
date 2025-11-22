import { Router } from 'express';
import { productController } from '../controllers';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { productValidations } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.get('/', optionalAuth, productValidations.query, productController.getProducts);
router.get('/:id', optionalAuth, productController.getProduct);

// Admin only routes
router.post('/', authenticate, authorize(UserRole.ADMIN), productValidations.create, productController.createProduct);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), productValidations.update, productController.updateProduct);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), productController.deleteProduct);
router.post('/:id/generate-composite', authenticate, authorize(UserRole.ADMIN), productController.generateComposite);

export default router;
