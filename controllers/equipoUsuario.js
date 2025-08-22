import { equipoUsuarioModel } from '../models/equipoUsuario.js';
import { equipoModel } from '../models/equipo.js';
import { usuarioModel } from '../models/Usuario.js';
import { Op } from 'sequelize';
import {
  validateEquiposUsuarios,
  validatePartialEquiposUsuarios,
} from '../schemas/equiposUsuarios.js';

export class equipoUsuarioController {
  static async getAll(req, res) {
    try {
      const idUsuario = req.query.idUsuario;
      const idEquipo = req.query.idEquipo;
      const equiposUsuarios = await equipoUsuarioModel.findAll({
        where: {
          ...(idUsuario && { idUsuario: { [Op.eq]: idUsuario } }),
          ...(idEquipo && { idEquipo: { [Op.eq]: idEquipo } }),
        },
        include: [
          {
            model: equipoModel,
            as: 'Equipo',
            attributes: ['nombre'],
          },
          {
            model: usuarioModel,
            as: 'Usuario',
            attributes: ['nombre'],
          },
        ],
      });
      if (equiposUsuarios.length === 0) {
        return res
          .status(404)
          .json({ message: 'No se encontró relación equipo-usuario' });
      }
      res.status(200).json(equiposUsuarios);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al obtener relación equipo-usuario' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const equipoUsuario = await equipoUsuarioModel.findByPk(id, {
        include: [
          {
            model: equipoModel,
            as: 'Equipo',
            attributes: ['nombre'],
          },
          {
            model: usuarioModel,
            as: 'Usuario',
            attributes: ['nombre'],
          },
        ],
      });
      if (!equipoUsuario) {
        return res
          .status(404)
          .json({ message: 'Relación equipo-usuario no encontrada' });
      }
      res.status(200).json(equipoUsuario);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al obtener relación equipo-usuario' });
    }
  }

  static async create(req, res) {
    try {
      req.body.idUsuario = req.user.id;
      const result = validateEquiposUsuarios(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      const jugadoresEquipo = await equipoUsuarioModel.findAll({
        where: {
          idEquipo: result.data.idEquipo,
        },
      });
      // Si el equipo ya tiene 8 jugadores asignados, no se puede agregar más
      if (jugadoresEquipo.length >= 8) {
        return res.status(400).json({
          message: 'El equipo ya tiene 8 jugadores asignados',
        });
      }

      const newEquipoUsuario = await equipoUsuarioModel.create(result.data);
      res.status(201).json(newEquipoUsuario);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al crear relación equipo-usuario' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validatePartialEquiposUsuarios(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      const equipoUsuario = await equipoUsuarioModel.findByPk(id);
      if (!equipoUsuario) {
        return res
          .status(404)
          .json({ message: 'Relación equipo-usuario no encontrada' });
      }
      await equipoUsuario.update(result.data);
      res.status(200).json(equipoUsuario);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al actualizar relación equipo-usuario' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const equipoUsuario = await equipoUsuarioModel.findByPk(id);
      if (!equipoUsuario) {
        return res
          .status(404)
          .json({ message: 'Relación equipo-usuario no encontrada' });
      }
      await equipoUsuario.destroy();
      res.status(200).json({ message: 'Relación eliminada' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al eliminar relación equipo-usuario' });
    }
  }
}
