import muroModel from '../models/muro.js';
import { validateMuro, validatePartialMuro } from '../schemas/muro.js';

export class muroController {
  static async getAll(req, res) {
    try {
      const { titulo } = req.query;
      if (titulo) {
        const result = validatePartialMuro({ titulo });
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }
      }

      const muros = await muroModel.findAll({
        where: titulo ? { titulo } : {},
      });
      if (!muros || muros.length === 0) {
        return res.status(404).json({ error: 'No se encontraron muros' });
      }
      res.status(200).json(muros);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los muros' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const muro = await muroModel.findByPk(id);
      if (!muro) {
        return res.status(404).json({ error: 'Muro no encontrado' });
      }
      res.status(200).json(muro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el muro' });
    }
  }

  static async create(req, res) {
    try {
      const result = validateMuro(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const newMuro = await muroModel.create(result.data);
      res.status(201).json(newMuro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el muro' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validatePartialMuro(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const muro = await muroModel.findByPk(id);
      if (!muro) {
        return res.status(404).json({ error: 'Muro no encontrado' });
      }

      await muro.update(result.data);
      res.status(200).json(muro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el muro' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await muroModel.destroy({
        where: { id },
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Muro no encontrado' });
      }
      res.status(200).json({ message: 'Muro eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el muro' });
    }
  }
}
