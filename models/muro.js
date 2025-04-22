import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

const muroModel = db.define(
  'Muro',
  {
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noticia: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

export default muroModel;
