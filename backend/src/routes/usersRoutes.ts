import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/usersController';

const router = Router();

router.use(authMiddleware);

router.get('/', listUsers);
router.post('/', adminMiddleware, createUser);
router.put('/:id', adminMiddleware, updateUser);
router.delete('/:id', adminMiddleware, deleteUser);

export default router;
