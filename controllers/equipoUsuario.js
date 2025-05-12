import equipoUsuarioModel from '../models/equipoUsuario.js';
import equipoModel from '../models/equipo.js';
import usuarioModel from '../models/Usuario.js';
import { Op } from 'sequelize';
import { validateEquiposUsuarios } from '../schemas/equiposUsuarios.js';

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
      } // Si el equipo no tiene jugadores asignados, se asigna el capitan como 1 (primero que crea es capitan)
      else if (jugadoresEquipo.length === 0) {
        result.data.capitan = 1;
      } else {
        result.data.capitan = 0;
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
}
