import politicaModel from '../models/politica.js';
import {
  validatePoliticas,
  validatePoliticasUpdate,
} from '../schemas/politicas.js';

export class politicaController {
  static async getAll(req, res) {
    try {
      const { descripcion } = req.query;
      if (descripcion) {
        const result = validatePoliticasUpdate({ descripcion });
        if (!result.success) {
          return res.status(400).json({ error: result.error });
        }
      }

      const politicas = await politicaModel.findAll({
        where: descripcion ? { descripcion } : {},
      });
      if (!politicas || politicas.length === 0) {
        return res.status(404).json({ error: 'No se encontraron politicas' });
      }
      res.status(200).json(politicas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las politicas' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const politica = await politicaModel.findByPk(id);

      if (!politica) {
        return res.status(404).json({ error: 'Politica no encontrada' });
      }
      res.status(200).json(politica);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la politica' });
    }
  }

  static async create(req, res) {
    try {
      const result = validatePoliticas(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const newPolitica = await politicaModel.create(result.data);
      res.status(201).json(newPolitica);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la politica' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validatePoliticasUpdate(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const politica_updated = await politicaModel.findByPk(id);
      if (!politica_updated) {
        return res.status(404).json({ error: 'Politica no encontrada' });
      }
      await politica_updated.update(result.data);
      res.status(200).json(politica_updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la politica' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await politicaModel.destroy({
        where: { nombre: id },
      });
      if (!deleted) {
        return res.status(404).json({ error: 'Politica no encontrada' });
      }
      res.status(200).json({ message: 'Politica eliminada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar la politica' });
    }
  }
}
