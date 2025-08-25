import { Router } from 'express';
import { turnoController } from '../controllers/turno.js';
import { authUser, authAdmin } from '../middlewares/auth.js';

export const turnoRouter = Router();

turnoRouter.get('/', authUser, turnoController.getAll);

turnoRouter.get('/disponibles', authUser, turnoController.getAvailableTurnos);

turnoRouter.get('/buscar-rival', authUser, turnoController.getBuscarRival);

turnoRouter.get(
  '/reporte-parrillas',
  authAdmin,
  turnoController.getParrillaList,
);

turnoRouter.get(
  '/reporte-cancelados',
  authAdmin,
  turnoController.getCanceladosList,
);

turnoRouter.get(
  '/reporte-ingresos',
  authAdmin,
  turnoController.getIngresosList,
);

turnoRouter.get(
  '/reporte-cantidad-dia',
  authAdmin,
  turnoController.getCantPorDiaList,
);

turnoRouter.get('/pre-precio', authUser, turnoController.getPrePrice);

turnoRouter.get('/:id', authUser, turnoController.getById);

turnoRouter.post('/', authUser, turnoController.create);

turnoRouter.post('/unirse-turno/:id', authUser, turnoController.unirseTurno);

turnoRouter.post('/cancelar/:id', authUser, turnoController.cancel);

turnoRouter.patch('/:id', authUser, turnoController.update);
