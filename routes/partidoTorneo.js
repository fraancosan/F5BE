import { Router } from 'express';
import { PartidoTorneoController } from '../controllers/partidoTorneo.js';

export const partidoTorneoRouter = Router();

partidoTorneoRouter.get('/', PartidoTorneoController.getAll);

partidoTorneoRouter.get('/:id', PartidoTorneoController.getById);

partidoTorneoRouter.post('/', PartidoTorneoController.create);

partidoTorneoRouter.patch('/:id', PartidoTorneoController.update);

partidoTorneoRouter.delete('/:id', PartidoTorneoController.delete);
