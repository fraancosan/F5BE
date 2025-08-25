import { Router } from 'express';
import { muroController } from '../controllers/muro.js';
import { authAdmin } from '../middlewares/auth.js';

export const muroRouter = Router();

muroRouter.get('/', muroController.getAll);

muroRouter.get('/vigente', muroController.getAllCurrent);

muroRouter.get('/:id', authAdmin, muroController.getById);

muroRouter.post('/', authAdmin, muroController.create);

muroRouter.patch('/:id', authAdmin, muroController.update);

muroRouter.delete('/:id', authAdmin, muroController.delete);
