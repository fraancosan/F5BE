import { Router } from 'express';
import { CanchaController } from '../controllers/cancha.js';

export const canchaRouter = Router();

canchaRouter.get('/', CanchaController.getAll);

canchaRouter.get('/:id', CanchaController.getById);

canchaRouter.post('/', CanchaController.create);

canchaRouter.patch('/:id', CanchaController.update);

canchaRouter.delete('/:id', CanchaController.delete);
