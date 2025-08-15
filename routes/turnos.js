import { Router } from 'express';
import { turnoController } from '../controllers/turno.js';
import { authUser } from '../middlewares/auth.js';

export const turnoRouter = Router();

turnoRouter.get('/', turnoController.getAll);

turnoRouter.get('/disponibles', turnoController.getAvailableTurnos);

turnoRouter.get('/buscar-rival', authUser, turnoController.getBuscarRival);

turnoRouter.get('/reporte-parrillas', turnoController.getParrillaList);

turnoRouter.get('/reporte-cancelados', turnoController.getCanceladosList);

turnoRouter.get('/pre-precio', authUser, turnoController.getPrePrice);

turnoRouter.get('/:id', turnoController.getById);

turnoRouter.post('/', authUser, turnoController.create);

turnoRouter.post('/unirse-turno/:id', authUser, turnoController.unirseTurno);

turnoRouter.post('/cancelar/:id', turnoController.cancel);

turnoRouter.patch('/:id', turnoController.update);
