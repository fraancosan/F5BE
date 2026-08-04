import { equipoUsuarioModel } from '../models/equipoUsuario.js';
import { equipoModel } from '../models/equipo.js';
import { usuarioModel } from '../models/Usuario.js';
import { Op } from 'sequelize';

export class equipoUsuarioController {
  static async getAll(req, res) {
    try {
      const idUsuario = req.user.id;
      const idEquipo = req.query.idEquipo;
      const equiposUsuarios = await equipoUsuarioModel.findAll({
        where: {
          idUsuario,
          ...(idEquipo && { idEquipo: { [Op.eq]: idEquipo } }),
        },
        include: [
          {
            model: equipoModel,
            as: 'Equipo',
            attributes: ['nombre', 'linkInvitacion'],
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

  static async getAllMiembros(req, res) {
    try {
      const idUsuario = req.user.id;
      const { idEquipo } = req.params;
      const equipo = await equipoUsuarioModel.findAll({
        where: {
          idUsuario,
          idEquipo,
        }});
      if (equipo.length === 0) {
        return res
          .status(404)
          .json({ message: 'No se encontró relación equipo-usuario' });
      } else {
        const equiposUsuarios = await equipoUsuarioModel.findAll({
          where: {
            idEquipo,
          },
          include: [
            {
              model: equipoModel,
              as: 'Equipo',
              attributes: ['nombre', 'linkInvitacion'],
            },
            {
              model: usuarioModel,
              as: 'Usuario',
              attributes: ['nombre'],
            },
          ],
        });
        res.status(200).json(equiposUsuarios);
      }
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
      // se une al equipo mediante link de invitacion
      const idUsuario = req.user.id;
      const { linkInvitacion } = req.body;
      if (!linkInvitacion) {
        return res.status(400).json({
          message: 'Se requiere el link de invitación para unirse al equipo',
        });
      } else {
        const equipo = await equipoModel.findOne({ where: { linkInvitacion } });
        if (!equipo) {
          return res.status(404).json({
            message:
              'No se encontró un equipo con el link de invitación proporcionado',
          });
        } else {
          const unido = await equipoUsuarioModel.findOne({
            where: {
              idUsuario,
              idEquipo: equipo.id,
            },
          });
          if (unido) {
            return res.status(400).json({
              message: 'El usuario ya está unido al equipo',
            });
          } else {
            const jugadoresEquipo = await equipoUsuarioModel.findAll({
              where: {
                idEquipo: equipo.id,
              },
            });
            // Si el equipo ya tiene 8 jugadores asignados, no se puede agregar más
            if (jugadoresEquipo.length >= 8) {
              return res.status(400).json({
                message: 'El equipo ya tiene 8 jugadores asignados',
              });
            } else {
              const newEquipoUsuario = await equipoUsuarioModel.create({
                idUsuario,
                idEquipo: equipo.id,
                capitan: false,
              });
            res.status(201).json(newEquipoUsuario);
          }
        }
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al unirse al equipo' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const equipoUsuario = await equipoUsuarioModel.findOne({
        where: { id, idUsuario: req.user.id },
      });
      if (!equipoUsuario) {
        return res
          .status(404)
          .json({ message: 'Relación equipo-usuario no encontrada' });
      } else if (equipoUsuario.capitan) {
        // si es capitan borro el equipo y todas las relaciones
        await equipoModel.destroy({ where: { id: equipoUsuario.idEquipo } });
        await equipoUsuarioModel.destroy({
          where: { idEquipo: equipoUsuario.idEquipo },
        });
        res.status(200).json({ message: 'Equipo eliminado' });
      } else {
        await equipoUsuario.destroy();
        res.status(200).json({ message: 'Equipo abandonado' });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al eliminar relación equipo-usuario' });
    }
  }
}
