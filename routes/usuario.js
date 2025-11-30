import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.js';
import { authUser, authAdmin } from '../middlewares/auth.js';

export const usuarioRouter = Router();

usuarioRouter.get('/', authAdmin, UsuarioController.getAll);

usuarioRouter.get('/mi-cuenta', authUser, UsuarioController.getOwnUser);

usuarioRouter.get('/premium', authAdmin, UsuarioController.getUserPremium);

usuarioRouter.get('/:id', authAdmin, UsuarioController.getById);

usuarioRouter.post('/', UsuarioController.create);

usuarioRouter.patch('/:id', authUser, UsuarioController.update);

usuarioRouter.delete('/:id', authAdmin, UsuarioController.delete);

usuarioRouter.post('/login', UsuarioController.loginUser);

usuarioRouter.post('/send-email/:id', authAdmin, UsuarioController.sendEmail);
