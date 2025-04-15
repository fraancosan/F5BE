import { Router } from 'express';
import { equipoController } from '../controllers/equipo.js';

export const equipoRouter = Router();

equipoRouter.get('/', equipoController.getAll);

equipoRouter.get('/:id', equipoController.getById);

equipoRouter.post('/', equipoController.create);

equipoRouter.patch('/:id', equipoController.update);

equipoRouter.delete('/:id', equipoController.delete);

equipoRouter.post('/:id/:idTorneo', equipoController.addTorneo);

equipoRouter.delete('/:id/:idTorneo', equipoController.removeTorneo);
