import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { getDashboardResumo } from '../controllers/dashboardsController';

const router = Router();

router.use(authMiddleware);
router.get('/resumo', getDashboardResumo);

export default router;
