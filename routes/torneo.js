import { Router } from 'express';
import { torneoController } from '../controllers/torneo.js';

export const torneoRouter = Router();

torneoRouter.get('/', torneoController.getAll);

torneoRouter.get('/:id', torneoController.getById);

torneoRouter.post('/', torneoController.create);

torneoRouter.patch('/:id', torneoController.update);

torneoRouter.delete('/:id', torneoController.delete);
