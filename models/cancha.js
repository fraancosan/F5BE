import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

export const canchaModel = db.define(
  'cancha',
  {
    disponible: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);
