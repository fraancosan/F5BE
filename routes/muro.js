import { Router } from 'express';
import { muroController } from '../controllers/muro.js';

export const muroRouter = Router();

muroRouter.get('/', muroController.getAll);

muroRouter.get('/:id', muroController.getById);

muroRouter.post('/', muroController.create);

muroRouter.patch('/:id', muroController.update);

muroRouter.delete('/:id', muroController.delete);
