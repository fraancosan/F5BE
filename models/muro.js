import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

const muroModel = db.define(
  'muro',
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
    freezeTableName: false,
    timestamps: false,
    tableName: 'Muro',
  },
);

export default muroModel;
