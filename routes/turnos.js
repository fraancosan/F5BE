import { Router } from 'express';
import { turnoController } from '../controllers/turno.js';

export const turnoRouter = Router();

turnoRouter.get('/', turnoController.getAll);

turnoRouter.get('/:id', turnoController.getById);

turnoRouter.post('/cancelar/:id', turnoController.cancel);
