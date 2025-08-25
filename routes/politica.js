import { Router } from 'express';
import { politicaController } from '../controllers/politica.js';
import { authAdmin } from '../middlewares/auth.js';

export const politicaRouter = Router();

politicaRouter.get('/', authAdmin, politicaController.getAll);

politicaRouter.get('/:id', authAdmin, politicaController.getById);

politicaRouter.post('/', authAdmin, politicaController.create);

politicaRouter.patch('/:id', authAdmin, politicaController.update);

politicaRouter.delete('/:id', authAdmin, politicaController.delete);
