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
