import { Router } from 'express';
import { torneoController } from '../controllers/torneo.js';
import { authAdmin } from '../middlewares/auth.js';

export const torneoRouter = Router();

torneoRouter.get('/', torneoController.getAll);

torneoRouter.get(
  '/reporte-ingresos',
  authAdmin,
  torneoController.getIngresosList,
);

torneoRouter.get('/:id', torneoController.getById);

torneoRouter.post('/', authAdmin, torneoController.create);

torneoRouter.patch('/:id', authAdmin, torneoController.update);

torneoRouter.delete('/:id', authAdmin, torneoController.delete);
