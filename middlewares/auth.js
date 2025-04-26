import jwt from 'jsonwebtoken';
import usuarioModel from '../models/Usuario.js';

export async function authAdmin(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      res.status(401).json({ message: 'No se envio el token' });
    } else {
      const payload = validateToken(token);
      req.payload = payload;
      const user = await usuarioModel.findByPk(payload.id);
      if (!user) {
        res.status(401).json({ message: 'Usuario no encontrado' });
      } else if (user.rol !== 'admin') {
        res.status(401).json({ message: 'No es administrador' });
      } else {
        req.user = user;
        next();
      }
    }
  } catch (error) {
    res.status(401).json({ message: 'Error al validar el token' });
  }
}

export async function authUser(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      res.status(401).json({ message: 'No se envio el token' });
    } else {
      const payload = validateToken(token);
      req.payload = payload;
      const user = await usuarioModel.findByPk(payload.id);
      if (!user) {
        res.status(401).json({ message: 'Usuario no encontrado' });
      } else {
        req.user = user;
        next();
      }
    }
  } catch (error) {
    res.status(401).json({ message: 'Error al validar el token' });
  }
}

export function onOwnAccount(req, res, next) {
  const user = req.user;
  const { id } = req.params;
  if (user.rol === 'admin' || user.id == id) {
    next();
  } else {
    res.status(401).json({ message: 'Sin autorizacion' });
  }
}

function getToken(req) {
  return req.headers.authorization.slice(7);
}

function validateToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_PASSWORD);
  } catch (error) {
    res.status(401).json({ message: 'Token invalido' });
  }
}
