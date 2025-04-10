import db from '../database/connection.js';
import { DataTypes } from 'sequelize';
import { equipoModel } from './equipo.js';
import { torneoModel } from './torneo.js';

export const partidoTorneoModel = db.define(
  'partidoTorneo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    idEquipo1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: equipoModel,
        key: 'id',
      },
    },
    idEquipo2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: equipoModel,
        key: 'id',
      },
    },
    idTorneo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: torneoModel,
        key: 'id',
      },
    },
    resultado: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
    tableName: 'partidosTorneo',
  },
);
