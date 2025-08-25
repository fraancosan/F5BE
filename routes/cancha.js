import { Router } from 'express';
import { CanchaController } from '../controllers/cancha.js';
import { authAdmin, authUser } from '../middlewares/auth.js';

export const canchaRouter = Router();

canchaRouter.get('/', authUser, CanchaController.getAll);

canchaRouter.get('/:id', authUser, CanchaController.getById);

canchaRouter.post('/', authAdmin, CanchaController.create);

canchaRouter.patch('/:id', authAdmin, CanchaController.update);

canchaRouter.delete('/:id', authAdmin, CanchaController.delete);
