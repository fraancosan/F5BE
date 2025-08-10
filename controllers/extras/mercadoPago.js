import {
  Preference,
  MercadoPagoConfig,
  Payment,
  PaymentRefund,
} from 'mercadopago';
import 'dotenv/config';
import { updateIdMP } from '../../models/turno.js';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

export class mercadoPagoController {
  /**
   * Crea las preferencias de pago en MercadoPago a partir de un pedido
   * @param {Object} param0 Objeto con los datos necesarios para crear la preferencia
   * @param {string} param0.title Título del pedido
   * @param {number} param0.precio Precio del pedido
   * @param {string} param0.idReferencia ID de referencia del pedido
   * @returns {Object} Preferencia de pago de MercadoPago
   * @throws {Error} Si ocurre un error al contactar con MercadoPago
   */
  static async createPreference({
    title,
    precio,
    idReferencia,
    endPoint = '',
  }) {
    try {
      const now = new Date();
      const twentyMinutesLater = new Date(now.getTime() + 20 * 60 * 1000);
      const items = [
        {
          id: idReferencia,
          title,
          quantity: 1,
          unit_price: precio,
          currency_id: 'ARS',
        },
      ];

      const body = {
        items,
        back_urls: {
          success: process.env.MP_URL_FRONTEND_SUCCESS + '/' + idReferencia,
          failure: process.env.MP_URL_FRONTEND_FAILURE,
          pending: process.env.MP_URL_FRONTEND_FAILURE,
        },
        notification_url: process.env.MP_URL_BACKEND + '/' + endPoint,
        auto_return: 'approved',
        purpose: 'wallet_purchase',
        statement_descriptor: 'RODO',
        binary_mode: true,
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: twentyMinutesLater.toISOString(),
        date_of_expiration: twentyMinutesLater.toISOString(),
        external_reference: idReferencia,
      };
      const preference = new Preference(client);
      return await preference.create({ body });
    } catch (error) {
      throw new Error('Ha ocurrido un error al contactar con MercadoPago');
    }
  }

  /**
   * It makes a total refund of a payment
   * @param {string} paymentId The payment id to refund
   * @returns {number} The status of the refund
   *  - 200 - The refund was aproved
   *  - 400 - The refund was rejected (probably because the payment was already refunded)
   *  - Other - Error
   */
  static async totalRefund({ paymentId }) {
    try {
      const refund = new PaymentRefund(client);
      await refund.create({
        payment_id: paymentId,
      });
      // ok
      return 200;
    } catch (error) {
      // 400 - Rejected (probably because the payment was already refunded)
      // else - Error
      return error.status;
    }
  }

  static async webhookPayment(req, res) {
    try {
      const { body } = req;
      const { endPoint } = req.params;

      // body.data.id = 123456; // Just for testing
      if (body.type === 'payment' && body.data.id != 123456) {
        const payment = await new Payment(client).get({ id: body.data.id });
        if (payment.status === 'approved') {
          // el id es seguro, no hace falta sanitizar
          const datos = {
            id: payment.external_reference,
            idMP: payment.id,
          };
          if (endPoint === 'turno') {
            await updateIdMP(datos);
          } else {
            res.status(404).json({
              message: 'EndPoint no especificado',
            });
          }
        }
      }
      res.status(200).send();
    } catch (error) {
      const status = error.status ?? 400;
      console.error(error);
      res.status(status).json({ message: error.message });
    }
  }
}
