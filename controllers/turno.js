import turnosModel from '../models/turno.js';
import { validateTurnos, validatePartialTurnos } from '../schemas/turnos.js';
import { mercadoPagoController } from './extras/mercadoPago.js';
import { Op, literal } from 'sequelize';

export class turnoController {
  static async getAll(req, res) {
    try {
      const turnos = await turnosModel.findAll();
      if (turnos.length === 0) {
        return res.status(404).json({ message: 'No se encontraron turnos' });
      }
      res.status(200).json(turnos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los turnos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const turno = await turnosModel.findOne({
        where: literal(`id = UUID_TO_BIN(?)`),
        replacements: [id],
      });

      if (!turno) {
        return res.status(404).json({ message: 'Turno no encontrado' });
      }
      res.status(200).json(turno);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el turno' });
    }
  }

  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const date = new Date();
      const turno = await turnosModel.findOne({
        where: {
          [Op.and]: [
            literal(`id = UUID_TO_BIN(?)`),
            { estado: 'señado' },
            literal(`TIMESTAMPDIFF(HOUR, ?, CONCAT(fecha,' ',hora)) >= 6`),
          ],
        },
        replacements: [id, date],
      });

      if (!turno) {
        return res.status(404).json({
          message:
            'No se ha encontrado el turno o el mismo no es apto para cancelarse',
        });
      }
      const refund = await mercadoPagoController.totalRefund({
        paymentId: turno.idMP,
      });

      let refund2;

      if (turno.idMPCompartido !== null) {
        refund2 = await mercadoPagoController.totalRefund({
          paymentId: turno.idMPCompartido,
        });
      }

      if (refund === 200 && (refund2 === 200 || refund2 === undefined)) {
        await turnosModel.update(
          { estado: 'cancelado' },
          {
            where: literal(`id = UUID_TO_BIN(?)`),
            replacements: [id],
          },
        );
        res.status(200).json({ message: 'Turno cancelado exitosamente' });
      } else {
        const error = new Error(
          'El reembolso ya ha sido procesado o ha fallado',
        );
        error.status = refund || refund2;
        throw error;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al cancelar el turno' });
    }
  }
}
