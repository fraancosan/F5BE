import { torneoModel } from '../models/torneo.js';
import { equipoModel } from '../models/equipo.js';
import { Op } from 'sequelize';
import { validateTorneos, validatePartialTorneos } from '../schemas/torneos.js';

export class torneoController {
  static async getAll(req, res) {
    try {
      // Validar los parámetros de consulta de torneo
      const { descripcion } = req.query;
      const result = validatePartialTorneos({ descripcion });
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      //validar los parámetros de consulta de equipo
      const torneos = await torneoModel.findAll({
        where: descripcion ? { descripcion } : {},
        order: [['fechaInicio', 'ASC']],
      });

      if (torneos.length === 0) {
        return res.status(404).json({ message: 'No se encontraron torneos' });
      }
      res.status(200).json(torneos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los torneos' });
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
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
      res.status(200).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el torneo' });
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
        return res.status(400).json({ message: result.error });
      }

      if (body.fechaInicio > body.fechaFin) {
        return res.status(400).json({
          message: 'La fecha de inicio debe ser menor que la fecha de fin',
        });
      }

      // Verificar que no existan torneos con fechas coincidentes
      const torneosExistentes = await torneoModel.findAll({
        where: {
          [Op.or]: [
            // El nuevo torneo empieza durante otro torneo existente
            {
              [Op.and]: [
                { fechaInicio: { [Op.lte]: body.fechaInicio } },
                { fechaFin: { [Op.gte]: body.fechaInicio } },
              ],
            },
            // El nuevo torneo termina durante otro torneo existente
            {
              [Op.and]: [
                { fechaInicio: { [Op.lte]: body.fechaFin } },
                { fechaFin: { [Op.gte]: body.fechaFin } },
              ],
            },
            // El nuevo torneo envuelve completamente a otro torneo existente
            {
              [Op.and]: [
                { fechaInicio: { [Op.gte]: body.fechaInicio } },
                { fechaFin: { [Op.lte]: body.fechaFin } },
              ],
            },
          ],
        },
      });

      if (torneosExistentes.length > 0) {
        return res.status(400).json({
          message:
            'Ya existe un torneo con fechas que coinciden con las fechas seleccionadas',
        });
      }

      const torneo = await torneoModel.create(req.body);
      res.status(201).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear el torneo' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      let body = req.body;
      if (body.fechaInicio) {
        body.fechaInicio = new Date(body.fechaInicio);
      }
      if (body.fechaFin) {
        body.fechaFin = new Date(body.fechaFin);
      }

      const result = validatePartialTorneos(body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const torneo = await torneoModel.findByPk(id);
      if (!torneo) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }

      // Si se están actualizando las fechas, verificar que no coincidan con otros torneos
      if (body.fechaInicio || body.fechaFin) {
        const fechaInicio = body.fechaInicio || torneo.fechaInicio;
        const fechaFin = body.fechaFin || torneo.fechaFin;

        if (fechaInicio > fechaFin) {
          return res.status(400).json({
            message: 'La fecha de inicio debe ser menor que la fecha de fin',
          });
        }

        // Verificar que no existan otros torneos con fechas coincidentes (excluyendo el actual)
        const torneosExistentes = await torneoModel.findAll({
          where: {
            id: { [Op.ne]: id },
            [Op.or]: [
              // El torneo actualizado empieza durante otro torneo existente
              {
                [Op.and]: [
                  { fechaInicio: { [Op.lte]: fechaInicio } },
                  { fechaFin: { [Op.gte]: fechaInicio } },
                ],
              },
              // El torneo actualizado termina durante otro torneo existente
              {
                [Op.and]: [
                  { fechaInicio: { [Op.lte]: fechaFin } },
                  { fechaFin: { [Op.gte]: fechaFin } },
                ],
              },
              // El torneo actualizado envuelve completamente a otro torneo existente
              {
                [Op.and]: [
                  { fechaInicio: { [Op.gte]: fechaInicio } },
                  { fechaFin: { [Op.lte]: fechaFin } },
                ],
              },
            ],
          },
        });

        if (torneosExistentes.length > 0) {
          return res.status(400).json({
            message:
              'Las fechas actualizadas coinciden con las fechas de otro torneo existente',
          });
        }
      }

      await torneo.update(result.data);
      res.status(200).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el torneo' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const torneo = await torneoModel.findByPk(id);
      if (!torneo) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }

      await torneo.destroy();
      res.status(200).json({ message: 'torneo eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el torneo' });
    }
  }
}
