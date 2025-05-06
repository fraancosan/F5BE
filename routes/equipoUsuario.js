import { Router } from 'express';
import { equipoUsuarioController } from '../controllers/equipoUsuario.js';

export const equipoUsuarioRouter = Router();

equipoUsuarioRouter.get('/', equipoUsuarioController.getAll);

equipoUsuarioRouter.get('/:id', equipoUsuarioController.getById);
