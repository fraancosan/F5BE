import { Router } from 'express';
import { politicaController } from '../controllers/politica.js';

export const politicaRouter = Router();

politicaRouter.get('/', politicaController.getAll);

politicaRouter.get('/:id', politicaController.getById);

politicaRouter.post('/', politicaController.create);

politicaRouter.patch('/:id', politicaController.update);

politicaRouter.delete('/:id', politicaController.delete);
