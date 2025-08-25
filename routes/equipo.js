import { Router } from 'express';
import { equipoController } from '../controllers/equipo.js';
import { authUser, authAdmin } from '../middlewares/auth.js';

export const equipoRouter = Router();

equipoRouter.get('/', authUser, equipoController.getAll);

equipoRouter.get('/:id', authAdmin, equipoController.getById);

equipoRouter.post('/', authUser, equipoController.create);

equipoRouter.patch('/:id', authUser, equipoController.update);

equipoRouter.delete('/:id', authUser, equipoController.delete);
