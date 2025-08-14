import partidoTorneoModel from '../models/partidoTorneo.js';
import { equipoModel } from '../models/equipo.js';
import { torneoModel } from '../models/torneo.js';
import {
  validatePartidosTorneos,
  validatePartialPartidosTorneos,
} from '../schemas/partidosTorneos.js';
import { Op } from 'sequelize';

export class PartidoTorneoController {
  static async getAll(req, res) {
    try {
      const idTorneo = req.query.idTorneo;
      const idEquipo = req.query.idEquipo;
      const fechaPartido = req.query.fechaPartido;
      const partidosTorneo = await parametrosQueryGetAll(
        idEquipo,
        idTorneo,
        fechaPartido,
      );
      if (partidosTorneo.length === 0) {
        return res.status(404).json({ message: 'No se encontraron partidos' });
      }
      res.status(200).json(partidosTorneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los partidos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const partidoTorneo = await partidoTorneoModel.findByPk(id, {
        include: [
          {
            model: equipoModel,
            as: 'Equipo1',
            attributes: ['nombre'],
          },
          {
            model: equipoModel,
            as: 'Equipo2',
            attributes: ['nombre'],
          },
          {
            model: torneoModel,
            as: 'Torneo',
            attributes: ['descripcion', 'fechaInicio', 'fechaFin'],
          },
        ],
      });
      if (!partidoTorneo) {
        return res.status(404).json({ message: 'Partido no encontrado' });
      }
      res.status(200).json(partidoTorneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el partido' });
    }
  }

  static async create(req, res) {
    try {
      let body = req.body;
      // Parseo de la fecha a tipo Date (SOLO POR TESTEO EN POSTMAN)
      body.fecha = new Date(body.fecha);
      const result = validatePartidosTorneos(body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const newPartidoTorneo = await partidoTorneoModel.create(result.data);
      res.status(201).json(newPartidoTorneo);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al crear el partido', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validatePartialPartidosTorneos(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const partidoTorneo = await partidoTorneoModel.findByPk(id);
      if (!partidoTorneo) {
        return res.status(404).json({ message: 'Partido no encontrado' });
      }

      await partidoTorneo.update(result.data);
      res.status(200).json(partidoTorneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el partido' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const partidoTorneo = await partidoTorneoModel.findByPk(id);
      if (!partidoTorneo) {
        return res.status(404).json({ message: 'Partido no encontrado' });
      }

      await partidoTorneo.destroy();
      res.status(200).json({ message: 'Partido eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el partido' });
    }
  }
}

async function parametrosQueryGetAll(id_equipo, id_torneo, fechaPartido) {
  fechaPartido ? (fechaPartido = new Date(fechaPartido)) : null;
  const where = {
    // Condiciones dinámicas (...) basadas en los parámetros de consulta
    ...(id_equipo && {
      //Op.or verifica si el id_equipo es igual a idEquipo1 o idEquipo2
      [Op.or]: [{ idEquipo1: id_equipo }, { idEquipo2: id_equipo }],
    }),
    ...(id_torneo && { idTorneo: id_torneo }),
    ...(fechaPartido && {
      fecha: fechaPartido,
    }),
  };

  // Consulta con las condiciones dinámicas
  return await partidoTorneoModel.findAll({
    where,
    include: [
      {
        model: equipoModel,
        as: 'Equipo1',
        attributes: ['nombre'],
      },
      {
        model: equipoModel,
        as: 'Equipo2',
        attributes: ['nombre'],
      },
      {
        model: torneoModel,
        as: 'Torneo',
        attributes: ['descripcion', 'fechaInicio', 'fechaFin'],
      },
    ],
  });
}
