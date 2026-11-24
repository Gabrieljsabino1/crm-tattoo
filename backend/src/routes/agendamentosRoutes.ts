import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../utils/upload';
import {
  listAgendamentos,
  getAgendamentoById,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  uploadImagensAgendamento,
  deleteImagemAgendamento,
} from '../controllers/agendamentosController';

const router = Router();

router.use(authMiddleware);

router.get('/', listAgendamentos);
router.get('/:id', getAgendamentoById);
router.post('/', createAgendamento);
router.put('/:id', updateAgendamento);
router.patch('/:id', updateAgendamento);
router.delete('/:id', deleteAgendamento);

// Upload de fotos de referência, esboços e resultado final
router.post('/:id/imagens', upload.array('imagens', 10), uploadImagensAgendamento);
router.delete('/:id/imagens/:imagemId', deleteImagemAgendamento);

export default router;
