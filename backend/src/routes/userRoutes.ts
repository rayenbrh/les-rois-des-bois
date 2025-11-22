import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';
import { userValidations } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate); // All routes require authentication

router.get('/', authorize(UserRole.ADMIN, UserRole.COMMERCIAL), userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', authorize(UserRole.ADMIN), userValidations.create, userController.createUser);
router.put('/:id', userValidations.update, userController.updateUser);
router.delete('/:id', authorize(UserRole.ADMIN), userController.deleteUser);
router.put('/:id/assign-commercial', authorize(UserRole.ADMIN), userValidations.assignCommercial, userController.assignCommercial);

export default router;
