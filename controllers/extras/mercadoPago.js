import {
  Preference,
  MercadoPagoConfig,
  Payment,
  PaymentRefund,
} from 'mercadopago';
import 'dotenv/config';

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
  static async createPreference({ title, precio, idReferencia }) {
    try {
      const now = new Date();
      const twentyMinutesLater = new Date(now.getTime() + 20 * 60 * 1000);
      const items = [
        {
          id: idReferencia,
          title: title,
          quantity: 1,
          unit_price: precio,
          currency_id: 'ARS',
        },
      ];

      const body = {
        items,
        back_urls: {
          success: process.env.URL_FRONTEND_MP_SUCCESS + '/' + idReferencia,
          failure: process.env.URL_FRONTEND_MP_FAILURE,
          pending: process.env.URL_FRONTEND_MP_FAILURE,
        },
        notification_url: process.env.URL_BACKEND_MP,
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
      // body.data.id = 123456; // Just for testing
      if (body.type === 'payment' && body.data.id != 123456) {
        const payment = await new Payment(client).get({ id: body.data.id });
        if (payment.status === 'approved') {
          const dataToSend = {
            idPedido: payment.external_reference,
            fechaPago: new Date(payment.date_approved),
            idMP: payment.id,
          };
          // need to save the payment in the database and update the order status
        }
      }
      res.status(200).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
