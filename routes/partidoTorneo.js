import { Router } from 'express';
import { PartidoTorneoController } from '../controllers/partidoTorneo.js';
import { authAdmin, authUser } from '../middlewares/auth.js';

export const partidoTorneoRouter = Router();

partidoTorneoRouter.get('/', authUser, PartidoTorneoController.getAll);

partidoTorneoRouter.get('/:id', authUser, PartidoTorneoController.getById);

partidoTorneoRouter.post('/', authAdmin, PartidoTorneoController.create);

partidoTorneoRouter.patch('/:id', authAdmin, PartidoTorneoController.update);

partidoTorneoRouter.delete('/:id', authAdmin, PartidoTorneoController.delete);
