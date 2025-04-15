import torneoModel from '../models/torneo.js';
import equipoModel from '../models/equipo.js';
import { validateTorneos, validatePartialTorneos } from '../schemas/torneos.js';

export class torneoController {
  static async getAll(req, res) {
    try {
      // Validar los parámetros de consulta de torneo
      const { descripcion } = req.query;
      const result = validatePartialTorneos({ descripcion });
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      //validar los parámetros de consulta de equipo
      const torneos = await torneoModel.findAll({
        where: descripcion ? { descripcion } : {},
        order: [['fechaInicio', 'ASC']],
      });

      if (torneos.length === 0) {
        return res.status(404).json({ error: 'No se encontraron torneos' });
      }
      res.status(200).json(torneos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los torneos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const torneo = await torneoModel.findByPk(id, {
        include: {
          model: equipoModel,
          through: { attributes: [] },
        },
      });

      if (!torneo) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }
      res.status(200).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el torneo' });
    }
  }

  static async create(req, res) {
    try {
      // Parseo de las fechas a tipo Date (SOLO POR TESTEO EN POSTMAN)
      let body = req.body;
      body.fechaInicio = new Date(body.fechaInicio);
      body.fechaFin = new Date(body.fechaFin);

      const result = validateTorneos(body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const torneo = await torneoModel.create(req.body);
      res.status(201).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el torneo' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validatePartialTorneos(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const torneo = await torneoModel.findByPk(id);
      if (!torneo) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      await torneo.update(result.data);
      res.status(200).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el torneo' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const torneo = await torneoModel.findByPk(id);
      if (!torneo) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      await torneo.destroy();
      res.status(200).json({ message: 'torneo eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el torneo' });
    }
  }
}
