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
}
