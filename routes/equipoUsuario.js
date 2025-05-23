import { Router } from 'express';
import { equipoUsuarioController } from '../controllers/equipoUsuario.js';

export const equipoUsuarioRouter = Router();

equipoUsuarioRouter.get('/', equipoUsuarioController.getAll);

equipoUsuarioRouter.get('/:id', equipoUsuarioController.getById);

equipoUsuarioRouter.post('/', equipoUsuarioController.create);

equipoUsuarioRouter.patch('/:id', equipoUsuarioController.update);

equipoUsuarioRouter.delete('/:id', equipoUsuarioController.delete);
