import canchaModel from '../models/cancha.js';
import { validateCanchas } from '../schemas/canchas.js';

export class CanchaController {
  static async getAll(req, res) {
    try {
      const { disponible } = req.query;
      if (disponible) {
        const result = validateCanchas({ disponible });
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }
      }

      const canchas = await canchaModel.findAll({
        where: disponible ? { disponible } : {},
      });
      if (!canchas || canchas.length === 0) {
        return res.status(404).json({ error: 'No se encontraron canchas' });
      }
      res.status(200).json(canchas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las canchas' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const cancha = await canchaModel.findByPk(id);

      if (!cancha) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }
      res.status(200).json(cancha);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la cancha' });
    }
  }

  static async create(req, res) {
    try {
      const result = validateCanchas(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const newCancha = await canchaModel.create(result.data);
      res.status(201).json(newCancha);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la cancha' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validateCanchas(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const cancha = await canchaModel.findByPk(id);
      if (!cancha) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }
      await cancha.update(result.data);
      res.status(200).json(cancha);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la cancha' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const cancha = await canchaModel.findByPk(id);
      if (!cancha) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }
      if (cancha.disponible === 1) {
        return res
          .status(400)
          .json({ error: 'No se puede eliminar una cancha disponible' });
      }

      await cancha.destroy();
      res.status(200).json({ message: 'Cancha eliminada con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar la cancha' });
    }
  }
}
