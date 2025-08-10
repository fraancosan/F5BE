import { Router } from 'express';
import { turnoController } from '../controllers/turno.js';
import { authUser } from '../middlewares/auth.js';

export const turnoRouter = Router();

turnoRouter.get('/', turnoController.getAll);

turnoRouter.get('/disponibles', turnoController.getAvailableTurnos);

turnoRouter.get('/pre-precio', authUser, turnoController.getPrePrice);

turnoRouter.get('/:id', turnoController.getById);

turnoRouter.post('/', authUser, turnoController.create);

turnoRouter.post('/cancelar/:id', turnoController.cancel);

turnoRouter.patch('/:id', turnoController.update);
