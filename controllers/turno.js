import { turnosModel } from '../models/turno.js';
import {
  validateTurnos,
  validatePartialTurnos,
  validateFecha,
  validateHora,
} from '../schemas/turnos.js';
import { mercadoPagoController } from './extras/mercadoPago.js';
import { Op, literal } from 'sequelize';
import { canchaModel, getAvailableCanchas } from '../models/cancha.js';
import { isPremium, usuarioModel } from '../models/Usuario.js';
import politicaModel from '../models/politica.js';
import db from '../database/connection.js';
import { getLocalDate } from '../utils/common.js';

export class turnoController {
  static async getAll(req, res) {
    try {
      const { fechai, fechaf, horai, horaf } = req.query;
      let where = {};

      if (req.user.rol !== 'admin') {
        where = {
          [Op.or]: [
            { idUsuario: req.user.id },
            { idUsuarioCompartido: req.user.id },
          ],
        };
      }

      // Validar y extraer el valor si es válido
      const parsedFechai = validateFecha(fechai);
      const parsedFechaf = validateFecha(fechaf);
      const parsedHorai = validateHora(horai);
      const parsedHoraf = validateHora(horaf);

      const fechaInicio = parsedFechai.success ? parsedFechai.data : undefined;
      const fechaFin = parsedFechaf.success ? parsedFechaf.data : undefined;
      const horaInicio = parsedHorai.success ? parsedHorai.data : undefined;
      const horaFin = parsedHoraf.success ? parsedHoraf.data : undefined;

      if (fechaInicio && fechaFin) {
        where.fecha = { [Op.between]: [fechaInicio, fechaFin] };
      } else if (fechaInicio) {
        where.fecha = { [Op.gte]: fechaInicio };
      } else if (fechaFin) {
        where.fecha = { [Op.lte]: fechaFin };
      }
      if (horaInicio && horaFin) {
        where.hora = { [Op.between]: [horaInicio, horaFin] };
      } else if (horaInicio) {
        where.hora = { [Op.gte]: horaInicio };
      } else if (horaFin) {
        where.hora = { [Op.lte]: horaFin };
      }

      const turnos = await turnosModel.findAll({
        where,
        order: [
          ['fecha', 'ASC'],
          ['hora', 'ASC'],
        ],
      });
      if (turnos.length === 0) {
        return res.status(404).json({ message: 'No se encontraron turnos' });
      }
      res.status(200).json(turnos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los turnos' });
    }
  }

  static async getBuscarRival(req, res) {
    try {
      const hoy = new Date();
      const fechaHoy = getLocalDate();
      const horaActual = new Date().getHours() + ':00:00';

      const turnos = await turnosModel.findAll({
        where: {
          buscandoRival: true,
          idUsuarioCompartido: null,
          estado: 'señado',
          idMP: { [Op.ne]: null }, // Solo turnos realmente señados
          [Op.not]: { idUsuario: req.user.id }, // Excluir turnos del usuario actual
          [Op.or]: [
            {
              fecha: { [Op.gt]: fechaHoy }, // fechas futuras, cualquier hora
            },
            {
              fecha: fechaHoy,
              hora: { [Op.gt]: horaActual }, // hoy, hora mayor a ahora
            },
          ],
        },
        order: [
          ['fecha', 'ASC'],
          ['hora', 'ASC'],
        ],
        include: [
          {
            model: usuarioModel,
            as: 'usuario',
            attributes: ['nombre'],
          },
        ],
      });
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
        const { horaAbre, horaCierra } = await getHorarios();
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
              [Op.between]: ['?', '?'],
            },
          },
          replacements: [`${horaAbre}:00:00`, `${horaCierra}:00:00`],
        });

        let allTurnos = [];
        for (let i = 0; i <= 15; i++) {
          const fecha = new Date(hoy);
          fecha.setDate(hoy.getDate() + i);
          const fechaStr = getLocalDate(fecha);

          const horaActual = i === 0 ? new Date().getHours() : -1; // Solo obtener hora actual si es hoy
          let dia = {
            fecha: fechaStr,
            horarios: [],
          };

          for (let hora = horaAbre; hora < horaCierra; hora++) {
            const horaStr = `${hora.toString().padStart(2, '0')}:00:00`;
            const turnosFiltrados = turnos.filter(
              (t) => t.fecha === fechaStr && t.hora === horaStr,
            );

            let disponible;
            // Si es hoy y la hora ya pasó, marcar como no disponible
            if (i === 0 && hora <= horaActual) {
              disponible = false;
            } else if (turnosFiltrados.length > 0) {
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

  static async getParrillaList(req, res) {
    try {
      const fechaDesde = new Date(req.query.fechaD);
      const fechaHasta = req.query.fechaH
        ? new Date(req.query.fechaH)
        : new Date();

      const turnosConParrilla = await turnosModel.findAll({
        where: {
          parrilla: true,
          fecha: {
            [Op.between]: [fechaDesde, fechaHasta],
          },
          estado: {
            [Op.not]: 'cancelado',
          },
        },
        attributes: ['id', 'fecha', 'hora', 'precio', 'idUsuario'],
        include: [
          {
            model: usuarioModel,
            as: 'usuario',
            attributes: ['nombre'],
            required: true,
          },
        ],
        order: [
          ['fecha', 'DESC'],
          ['hora', 'DESC'],
        ],
      });

      if (turnosConParrilla.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron turnos con parrilla reservada',
        });
      }

      // Obtener el precio de la parrilla desde políticas
      const politicaParrilla = await politicaModel.findOne({
        where: { nombre: 'precioParrilla' },
      });

      const precioParrilla = politicaParrilla
        ? parseFloat(politicaParrilla.descripcion)
        : 0;

      const cantidadTotalReservas = turnosConParrilla.length;
      const ingresosTotales = cantidadTotalReservas * precioParrilla;

      const respuesta = {
        resumen: {
          cantidadTotalReservas,
          ingresosTotales,
        },
        turnos: turnosConParrilla,
      };

      res.status(200).json(respuesta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener listado de parrilla' });
    }
  }

  static async getCanceladosList(req, res) {
    try {
      const fechaDesde = new Date(req.query.fechaD);
      const fechaHasta = req.query.fechaH
        ? new Date(req.query.fechaH)
        : new Date();

      const turnosCancelados = await turnosModel.findAll({
        where: {
          estado: 'cancelado',
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
        },
        attributes: [
          'fecha',
          'hora',
          'buscandoRival',
          'parrilla',
          ['precio', 'perdidaIndividual'],
          [db.literal('SUM(precio) OVER()'), 'totalPerdidas'],
          [
            db.literal('COUNT(*) OVER(PARTITION BY `usuario`.`id`)'),
            'cantidadDelUsuario',
          ],
        ],
        include: [
          {
            model: usuarioModel,
            as: 'usuario',
            attributes: ['dni'],
            required: true,
          },
        ],
        order: [
          ['fecha', 'DESC'],
          ['hora', 'DESC'],
        ],
        raw: true,
        nest: true,
      });

      if (turnosCancelados.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron turnos cancelados',
        });
      }

      const respuesta = {
        cantidadTotalCancelados: turnosCancelados.length,
        totalPerdidas: Number(turnosCancelados[0].totalPerdidas),
        turnos: turnosCancelados,
      };

      res.status(200).json(respuesta);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al obtener listado de turnos cancelados' });
    }
  }

  static async getIngresosList(req, res) {
    try {
      const fechaDesde = new Date(req.query.fechaD);
      const fechaHasta = req.query.fechaH
        ? new Date(req.query.fechaH)
        : new Date();

      const ingresos = await turnosModel.findAll({
        where: {
          estado: 'finalizado',
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
        },
        attributes: [
          'fecha',
          [db.fn('SUM', db.col('precio')), 'ingresosDelDia'],
          [db.literal('SUM(SUM(precio)) OVER ()'), 'ingresosTotales'],
        ],
        group: ['fecha'],
        order: [['fecha', 'DESC']],
        raw: true,
      });

      if (ingresos.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron turnos para calcular el ingreso',
        });
      }

      res.status(200).json({
        ingresos,
        totalIngresos: Number(ingresos[0].ingresosTotales),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener listado de ingresos' });
    }
  }

  static async getCantPorDiaList(req, res) {
    try {
      const fechaDesde = new Date(req.query.fechaD);
      const fechaHasta = req.query.fechaH
        ? new Date(req.query.fechaH)
        : new Date();

      const turnosPorDia = await turnosModel.findAll({
        where: {
          // estado: 'finalizado',
          fecha: {
            [Op.between]: [fechaDesde, fechaHasta],
          },
        },
        attributes: [
          'fecha',
          [db.fn('COUNT', db.col('id')), 'cantidadTurnos'],
          [db.fn('SUM', db.col('buscandoRival')), 'cantidadBuscandoRival'],
          [db.fn('SUM', db.col('parrilla')), 'cantidadParrilla'],
        ],
        group: ['fecha'],
        order: [['fecha', 'DESC']],
      });

      if (turnosPorDia.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron turnos para calcular la cantidad por día',
        });
      }

      const totales = await turnosModel.findOne({
        where: {
          // estado: 'finalizado',
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
        },
        attributes: [
          [db.fn('COUNT', db.col('id')), 'totalTurnos'],
          [db.fn('SUM', db.col('buscandoRival')), 'totalBuscandoRival'],
          [db.fn('SUM', db.col('parrilla')), 'totalParrilla'],
        ],
      });

      res.status(200).json({
        totales,
        turnosPorDia,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al obtener listado de turnos por día' });
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
        const { horaAbre, horaCierra } = await getHorarios();
        const horaTurno = parseInt(result.data.hora.split(':')[0], 10);
        if (horaTurno < horaAbre || horaTurno >= horaCierra) {
          return res.status(400).json({
            message: `La hora del turno debe estar entre las ${horaAbre}:00 y las ${horaCierra - 1}:00`,
          });
        }
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
          endPoint: 'turno',
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

  static async unirseTurno(req, res) {
    try {
      const { id } = req.params;
      const idUsuarioCompartido = req.user.id;

      const turno = await getById(id);
      if (!turno) {
        return res.status(404).json({ message: 'Turno no encontrado' });
      } else if (turno.estado !== 'señado' || !turno.idMP) {
        return res.status(400).json({
          message: 'El turno no se encuentra en estado "señado"',
        });
      } else if (!turno.buscandoRival || turno.idUsuarioCompartido) {
        return res.status(400).json({
          message: 'El turno no está disponible para unirse',
        });
      } else {
        const preference = await mercadoPagoController.createPreference({
          title: `Seña RODO F5 | Día: ${turno.fecha} | Hora: ${turno.hora}`,
          precio: turno.precioSeña,
          idReferencia: `${turno.id}-compartido`,
          endPoint: 'turno-compartido',
        });
        await turno.update({
          urlPreferenciaPagoCompartido: preference.init_point,
          idUsuarioCompartido,
          fechaUsuarioCompartido: new Date(),
        });
        res.status(200).json(turno);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al unirse al turno' });
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

async function getHorarios() {
  const politicas = await politicaModel.findAll({
    where: { nombre: ['horaAbre', 'horaCierra'] },
  });
  const getValue = (key) => {
    const politica = politicas.find((p) => p.nombre === key);
    if (!politica) {
      throw new Error(`Política ${key} no encontrada`);
    }
    return parseInt(politica.descripcion.split(':')[0], 10);
  };
  return {
    horaAbre: getValue('horaAbre'),
    horaCierra: getValue('horaCierra'),
  };
}
