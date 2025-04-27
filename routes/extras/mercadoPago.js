import { Router } from 'express';
import { mercadoPagoController } from '../../controllers/extras/mercadoPago.js';
import { authMercadoPagoWebhook } from '../../middlewares/auth.js';
export const mercadoPagoRouter = Router();

mercadoPagoRouter.post(
  '/webhook',
  authMercadoPagoWebhook,
  mercadoPagoController.webhookPayment,
);
