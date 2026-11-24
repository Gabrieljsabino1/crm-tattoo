import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../utils/upload';
import {
  listOrcamentos,
  createOrcamento,
  updateOrcamento,
  deleteOrcamento,
  converterOrcamentoEmAgendamento,
} from '../controllers/orcamentosController';

const router = Router();

router.use(authMiddleware);

router.get('/', listOrcamentos);
router.post('/', upload.single('imagem'), createOrcamento);
router.put('/:id', updateOrcamento);
router.patch('/:id', updateOrcamento);
router.delete('/:id', deleteOrcamento);
router.post('/:id/converter', converterOrcamentoEmAgendamento);

export default router;
