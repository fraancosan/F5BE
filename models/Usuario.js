import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';
import politicaModel from './politica.js';

const usuarioModel = db.define(
  'Usuarios',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    mail: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    contraseña: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'usuario',
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);

async function isPremium(id) {
  try {
    const [result] = await db.query(
      `
      SELECT COUNT(*) AS Total 
      FROM Usuarios u
      JOIN Turnos t ON ( 
        u.id = t.idUsuario 
        OR 
        u.id = t.idUsuarioCompartido
      )
      WHERE 
        t.estado = 'finalizado' 
        AND t.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND u.id = UUID_TO_BIN(?)
      `,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      },
    );
    const reservasPremium = await politicaModel.findByPk(
      'reservasNecesariasPremium',
    );
    return result.total >= reservasPremium.descripcion;
  } catch (error) {
    return false;
  }
}

export { usuarioModel, isPremium };
