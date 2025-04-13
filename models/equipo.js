import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

const equipoModel = db.define(
  'Equipos',
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

export default equipoModel;
