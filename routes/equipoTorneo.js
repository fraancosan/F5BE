import { Router } from 'express';
import { equipoTorneoController } from '../controllers/equipoTorneo.js';
import { authUser } from '../middlewares/auth.js';

export const equipoTorneoRouter = Router();

equipoTorneoRouter.post(
  '/:idEquipo/:idTorneo',
  authUser,
  equipoTorneoController.addTorneo,
);
