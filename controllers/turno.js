import turnosModel from '../models/turno.js';
import { validateTurnos, validatePartialTurnos } from '../schemas/turnos.js';
import { mercadoPagoController } from './extras/mercadoPago.js';
import { Op, literal } from 'sequelize';
import { canchaModel, getAvailableCanchas } from '../models/cancha.js';
import { isPremium } from '../models/Usuario.js';
import politicaModel from '../models/politica.js';
import db from '../database/connection.js';

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

  static async getAvailableTurnos(req, res) {
    try {
      const canchas = await canchaModel.findAll({
        where: {
          disponible: 1,
        },
      });
      if (canchas.length === 0) {
        return res.status(409).json({
          message: 'No hay canchas disponibles',
        });
      } else {
        const hoy = new Date();
        const quincena = new Date(
          new Date().setDate(new Date().getDate() + 15),
        );
        // horarios no disponibles
        const turnos = await turnosModel.findAll({
          where: {
            [Op.not]: { estado: 'cancelado' },
            fecha: {
              [Op.between]: [hoy, quincena],
            },
            hora: {
              [Op.between]: ['10:00:00', '23:59:59'],
            },
          },
        });

        let allTurnos = [];
        for (let i = 0; i <= 15; i++) {
          const fecha = new Date(hoy);
          fecha.setDate(hoy.getDate() + i);
          const fechaStr = fecha.toISOString().split('T')[0];
          let dia = {
            fecha: fechaStr,
            horarios: [],
          };

          for (let hora = 10; hora <= 23; hora++) {
            const horaStr = `${hora.toString().padStart(2, '0')}:00:00`;
            const turnosFiltrados = turnos.filter(
              (t) => t.fecha === fechaStr && t.hora === horaStr,
            );

            let disponible;
            if (turnosFiltrados.length > 0) {
              const idOcupados = turnosFiltrados.map((t) => t.idCancha);
              // Hay alguna cancha libre?
              disponible = canchas.some((c) => !idOcupados.includes(c.id));
            } else {
              disponible = true;
            }

            dia.horarios.push({
              disponible,
              hora: horaStr,
            });
          }
          allTurnos.push(dia);
        }
        res.status(200).json(allTurnos);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los turnos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const turno = await getById(id);

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
      } else if (turno.buscandoRival) {
        return res.status(400).json({
          message: 'No se puede cancelar un turno compartido',
        });
      }

      const refund = await mercadoPagoController.totalRefund({
        paymentId: turno.idMP,
      });

      if (refund === 200) {
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
        error.status = refund;
        throw error;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al cancelar el turno' });
    }
  }
  static async getPrePrice(req, res) {
    try {
      let { parrilla, compartido } = req.query;

      const rta = await getPrice({
        user: req.user,
        parrilla: parrilla == 1,
        compartido: compartido == 1,
      });
      res.status(200).json(rta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el precio del turno' });
    }
  }

  static async create(req, res) {
    const t = await db.transaction();
    try {
      const result = validateTurnos(req.body);
      if (!result.success) {
        const error = new Error(result.error);
        error.status = 400;
        throw error;
      } else {
        const body = result.data;
        body.idUsuario = req.user.id;
        body.estado = 'señado';
        const canchas = await getAvailableCanchas(
          result.data.fecha,
          result.data.hora,
        );

        if (canchas.length === 0) {
          return res.status(409).json({
            message: 'No hay canchas disponibles',
          });
        } else {
          body.idCancha = canchas[0].id;
        }

        const pricing = await getPrice({
          user: req.user,
          parrilla: result.data.parrilla,
          compartido: result.data.buscandoRival,
        });

        body.precio = pricing.precio;
        body.precioSeña = pricing.precioSeña;

        let turno = await turnosModel.create(body, { transaction: t });
        const preference = await mercadoPagoController.createPreference({
          title: `Seña RODO F5 | Día: ${turno.fecha} | Hora: ${turno.hora}`,
          precio: turno.precioSeña,
          idReferencia: turno.id,
        });

        await turno.update(
          { urlPreferenciaPago: preference.init_point },
          { transaction: t },
        );
        await t.commit();
        res.status(200).json(turno);
      }
    } catch (error) {
      await t.rollback();
      if (error.status) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el turno' });
      }
    }
  }

  static async update(req, res) {
    try {
      const result = validatePartialTurnos(req.body);
      if (!result.success) {
        res.status(400).json({ message: result.error });
      } else if (Object.keys(result.data).length === 0) {
        res
          .status(400)
          .json({ message: 'No se especificaron campos a actualizar' });
      } else {
        const { id } = req.params;
        let turno = await getById(id);
        const fecha = result.data.fecha ?? turno.fecha;
        const hora = result.data.hora ?? turno.hora;
        const idCancha = result.data.idCancha ?? turno.idCancha;

        if (!turno) {
          return res.status(404).json({ message: 'Turno no encontrado' });
        } else if (turno.estado !== 'señado') {
          return res.status(400).json({
            message: 'El turno no se encuentra en estado "señado"',
          });
        } else if (
          ((idCancha && idCancha !== turno.idCancha) ||
            (fecha &&
              hora &&
              (fecha !== turno.fecha || hora !== turno.hora))) &&
          !(await notOtherTurn(fecha, hora, idCancha))
        ) {
          return res.status(400).json({
            message:
              'Ya existe un turno agendado para esa fecha y hora en esa cancha',
          });
        } else {
          turno = await turno.update(result.data);
          res.status(200).json(turno);
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el turno' });
    }
  }
}

async function notOtherTurn(fecha, hora, idCancha) {
  const result = await turnosModel.findOne({
    where: {
      fecha,
      hora,
      idCancha,
      estado: 'señado',
    },
  });
  return result === null;
}

async function getById(id) {
  const result = await turnosModel.findOne({
    where: literal(`id = UUID_TO_BIN(?)`),
    replacements: [id],
  });
  return result;
}

async function getPrice({ user, parrilla, compartido }) {
  const politicas = await politicaModel.findAll({
    where: {
      nombre: [
        'precioTurno',
        'porcentajeSeña',
        'precioParrilla',
        'descuentoPremium',
      ],
    },
  });

  const getValor = (nombre) =>
    parseFloat(politicas.find((p) => p.nombre === nombre)?.descripcion || 0);

  let precio = getValor('precioTurno');

  if (parrilla) {
    precio += getValor('precioParrilla');
  }

  if (compartido) {
    precio /= 2;
  } else {
    const premium = await isPremium(user.id);
    if (premium) {
      precio *= 1 - getValor('descuentoPremium');
    }
  }

  const precioSeña = precio * getValor('porcentajeSeña');

  return {
    precio,
    precioSeña,
  };
}
