import { usuarioModel } from '../models/Usuario.js';
import {
  validateUsuarios,
  validatePartialUsuarios,
} from '../schemas/usuarios.js';
import politicaModel from '../models/politica.js';
import db from '../database/connection.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UsuarioController {
  static async getAll(req, res) {
    try {
      const mail = req.query.mail;
      const result = validatePartialUsuarios({ mail });
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      const usuarios = await usuarioModel.findAll({
        where: mail ? { mail } : {},
        order: [['nombre', 'ASC']],
      });
      if (usuarios.length === 0) {
        return res.status(404).json({ message: 'No se encontraron usuarios' });
      }
      res.status(200).json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioModel.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el usuario' });
    }
  }

  static async getUserPremium(req, res) {
    try {
      const reservasPremium = await politicaModel.findByPk(
        'reservasNecesariasPremium',
      );
      if (!reservasPremium) {
        return res.status(500).json({
          message: 'Error al obtener la política de usuarios premium',
        });
      }
      const reservasNecesarias = parseInt(reservasPremium.descripcion);
      const usuariosPremium = await db.query(
        `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.mail,
        u.telefono,
        u.rol,
        COUNT(*) AS totalReservas
      FROM Usuarios u
      JOIN Turnos t ON ( 
        u.id = t.idUsuario 
        OR 
        u.id = t.idUsuarioCompartido
      )
      WHERE 
        t.estado = 'finalizado' 
        AND t.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id, u.nombre, u.apellido, u.mail, u.telefono, u.rol
      HAVING COUNT(*) >= ?
      ORDER BY u.nombre ASC
      `,
        {
          replacements: [reservasNecesarias],
          type: QueryTypes.SELECT,
        },
      );
      if (usuariosPremium.length === 0) {
        return res
          .status(404)
          .json({ message: 'No se encontraron usuarios premium' });
      }
      res.status(200).json(usuariosPremium);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al listar los usuarios premium' });
    }
  }

  static async create(req, res) {
    try {
      const result = validateUsuarios(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      result.data.contraseña = await bcrypt.hash(result.data.contraseña, salt);

      const usuario = await usuarioModel.create(result.data);
      res.status(201).json(usuario);
    } catch (error) {
      if (error.message.includes('Validation error')) {
        res
          .status(409)
          .json({ error: 'El mail ingresado ya se encuentra registrado' });
      } else {
        res.status(500).json({ message: 'Error al crear el usuario' });
      }
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const result = validatePartialUsuarios(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const usuario = await usuarioModel.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Encriptar la contraseña si se actualiza
      if (result.data.contraseña) {
        const salt = await bcrypt.genSalt(10);
        result.data.contraseña = await bcrypt.hash(
          result.data.contraseña,
          salt,
        );
      }

      await usuario.update(result.data);
      res.status(200).json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioModel.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await usuario.destroy();
      res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
  }

  static async loginUser(req, res) {
    try {
      const result = validatePartialUsuarios(req.body);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      } else {
        const { mail, contraseña } = result.data;
        const usuario = await usuarioModel.findOne({ where: { mail } });
        if (!usuario) {
          res
            .status(400)
            .json({ message: 'El mail o la contraseña no son correctos' });
        } else {
          const match = await bcrypt.compare(contraseña, usuario.contraseña);
          if (!match) {
            res
              .status(400)
              .json({ message: 'El mail o la contraseña no son correctos' });
          } else {
            const token = jwt.sign(
              {
                mail: usuario.mail,
                id: usuario.id,
                rol: usuario.rol,
              },
              process.env.JWT_PASSWORD,
              { expiresIn: '1h' },
            );
            res.json({ message: 'Usuario logueado', token: token });
          }
        }
      }
    } catch (error) {
      res.status(500).json({
        message: 'Ocurrio un error a la hora de loguear el usuario',
      });
    }
  }
}
