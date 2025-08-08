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
