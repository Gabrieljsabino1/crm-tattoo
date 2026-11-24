import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../controllers/clientesController';

const router = Router();

router.use(authMiddleware);

router.get('/', listClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;
