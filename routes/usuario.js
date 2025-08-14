import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.js';

export const usuarioRouter = Router();

usuarioRouter.get('/', UsuarioController.getAll);

usuarioRouter.get('/premium', UsuarioController.getUserPremium);

usuarioRouter.get('/:id', UsuarioController.getById);

usuarioRouter.post('/', UsuarioController.create);

usuarioRouter.patch('/:id', UsuarioController.update);

usuarioRouter.delete('/:id', UsuarioController.delete);

usuarioRouter.post('/login', UsuarioController.loginUser);

usuarioRouter.post('/send-email/:id', UsuarioController.sendEmail);
