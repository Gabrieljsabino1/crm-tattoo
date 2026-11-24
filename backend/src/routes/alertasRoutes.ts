import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { getAlertas } from '../controllers/alertasController';

const router = Router();

router.use(authMiddleware);
router.get('/', getAlertas);

export default router;
