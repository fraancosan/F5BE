import muroModel from '../models/muro.js';
import { validateMuro, validatePartialMuro } from '../schemas/muro.js';

export class muroController {
  static async getAll(req, res) {
    try {
      const { titulo } = req.query;
      if (titulo) {
        const result = validatePartialMuro({ titulo });
        if (!result.success) {
          return res.status(400).json({ message: result.error });
        }
      }

      const muros = await muroModel.findAll({
        where: titulo ? { titulo } : {},
      });
      if (!muros || muros.length === 0) {
        return res.status(404).json({ message: 'No se encontraron muros' });
      }
      res.status(200).json(muros);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los muros' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const muro = await muroModel.findByPk(id);
      if (!muro) {
        return res.status(404).json({ message: 'Muro no encontrado' });
      }
      res.status(200).json(muro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el muro' });
    }
  }

  static async create(req, res) {
    try {
      // Parseo de las fechas a tipo Date (SOLO POR TESTEO EN POSTMAN)
      let body = req.body;
      body.fecha = new Date(body.fecha);
      body.fechaFin = new Date(body.fechaFin);

      const result = validateMuro(body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const newMuro = await muroModel.create(body);
      res.status(201).json(newMuro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear el muro' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      // Parseo de las fechas a tipo Date (SOLO POR TESTEO EN POSTMAN)
      let body = req.body;
      console.log(body);
      if (body.fecha) {
        body.fecha = new Date(body.fecha);
      }
      if (body.fechaFin) {
        body.fechaFin = new Date(body.fechaFin);
      }

      const result = validatePartialMuro(body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const muro = await muroModel.findByPk(id);
      if (!muro) {
        return res.status(404).json({ message: 'Muro no encontrado' });
      }

      await muro.update(body);
      res.status(200).json(muro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el muro' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await muroModel.destroy({
        where: { id },
      });
      if (!deleted) {
        return res.status(404).json({ message: 'Muro no encontrado' });
      }
      res.status(200).json({ message: 'Muro eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el muro' });
    }
  }
}
