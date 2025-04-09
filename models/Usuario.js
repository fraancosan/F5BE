import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

export const usuarioModel = db.define(
  'usuario',
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
