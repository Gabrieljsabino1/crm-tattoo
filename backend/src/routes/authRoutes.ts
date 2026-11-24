import { Router } from 'express';
import { login, registerFirstAdmin } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register-admin', registerFirstAdmin);

export default router;
