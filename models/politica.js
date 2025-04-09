import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

export const politicaModel = db.define(
  'politica',
  {
    nombre: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);
