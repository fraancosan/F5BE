import db from '../database/connection.js';
import { DataTypes } from 'sequelize';
import { equipoModel } from './equipo.js';
import { torneoModel } from './torneo.js';

const equipoTorneoModel = db.define(
  'EquiposTorneos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    idEquipo: {
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
    idMP: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    urlPreferenciaPago: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);

async function updateIdMP({ id, idMP }) {
  try {
    await db.query(
      `
      UPDATE EquiposTorneos
      SET idMP = ?
      WHERE id = UUID_TO_BIN(?)
      `,
      {
        replacements: [idMP, id],
        type: QueryTypes.UPDATE,
      },
    );
  } catch (error) {
    error.status = 500;
    throw error;
  }
}

export { equipoTorneoModel, updateIdMP };
