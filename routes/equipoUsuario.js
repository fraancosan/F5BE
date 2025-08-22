import { Router } from 'express';
import { equipoUsuarioController } from '../controllers/equipoUsuario.js';
import { authUser, authAdmin } from '../middlewares/auth.js';

export const equipoUsuarioRouter = Router();

equipoUsuarioRouter.get('/', authUser, equipoUsuarioController.getAll);

equipoUsuarioRouter.get('/:id', authAdmin, equipoUsuarioController.getById);

equipoUsuarioRouter.post('/', authUser, equipoUsuarioController.create);

equipoUsuarioRouter.patch('/:id', authUser, equipoUsuarioController.update);

equipoUsuarioRouter.delete('/:id', authUser, equipoUsuarioController.delete);
