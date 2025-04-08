import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

export const equipoModel = db.define(
  'equipo',
  {
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);
