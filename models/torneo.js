import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

const torneoModel = db.define(
  'torneo',
  {
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    precioInscripcion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    cantidadEquipos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);

export default torneoModel;
