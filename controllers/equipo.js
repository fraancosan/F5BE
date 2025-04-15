import equipoModel from '../models/equipo.js';
import torneoModel from '../models/torneo.js';
import '../models/associations.js';
import { validateEquipos } from '../schemas/equipos.js';

export class equipoController {
  static async getAll(req, res) {
    try {
      const { nombre } = req.query;
      if (nombre) {
        const result = validateEquipos({ nombre });
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }
      }

      const equipos = await equipoModel.findAll({
        where: nombre ? { nombre } : {},
      });
      if (!equipos || equipos.length === 0) {
        return res.status(404).json({ error: 'No se encontraron equipos' });
      }
      res.status(200).json(equipos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los equipos' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      // booleano para verificar si se debe incluir el torneo
      const torneo = req.query.torneo === 'true';
      let equipo;
      if (torneo) {
        equipo = await equipoModel.findOne({
          where: { id },
          include: {
            model: torneoModel,
            attributes: ['id', 'descripcion', 'fechaInicio', 'fechaFin'],
            through: { attributes: [] }, // Excluir atributos de la tabla intermedia
          },
        });
      } else {
        equipo = await equipoModel.findByPk(id);
      }

      if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }
      res.status(200).json(equipo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el equipo' });
    }
  }

  static async create(req, res) {
    try {
      const result = validateEquipos(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const newEquipo = await equipoModel.create(result.data);
      res.status(201).json(newEquipo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el equipo' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validateEquipos(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const equipo = await equipoModel.findByPk(id);
      if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }

      await equipo.update(result.data);
      res.status(200).json(equipo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el equipo' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const equipo = await equipoModel.findByPk(id);
      if (!equipo) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }

      await equipo.destroy();
      res.status(200).json({ message: 'Equipo eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el equipo' });
    }
  }

  static async addTorneo(req, res) {
    try {
      const { id, idTorneo } = req.params;
      const equipo = await equipoModel.findByPk(id);
      const torneo = await torneoModel.findByPk(idTorneo);

      if (!equipo || !torneo) {
        return res.status(404).json({ error: 'Equipo o torneo no encontrado' });
      }

      await equipo.addTorneo(torneo);
      res.status(200).json({ message: 'Torneo agregado al equipo' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al agregar el torneo al equipo' });
    }
  }

  static async removeTorneo(req, res) {
    try {
      const { id, idTorneo } = req.params;
      const equipo = await equipoModel.findByPk(id);
      const torneo = await torneoModel.findByPk(idTorneo);

      if (!equipo || !torneo) {
        return res.status(404).json({ error: 'Equipo o torneo no encontrado' });
      }

      await equipo.removeTorneo(torneo);
      res.status(200).json({ message: 'Torneo eliminado del equipo' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el torneo del equipo' });
    }
  }
}
