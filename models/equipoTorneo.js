import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';
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
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
      WHERE id = ?
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

async function cancelInscripcion() {
  const date = new Date();
  const timeLimit = process.env.MP_TIME ?? 30;

  try {
    await db.query(
      `
      DELETE FROM EquiposTorneos
      WHERE 
        idMP IS NULL
        AND
        TIMESTAMPDIFF(MINUTE, fechaCreacion, ?) >= ?
      `,
      {
        replacements: [date, timeLimit],
        type: QueryTypes.DELETE,
      },
    );
  } catch (error) {
    console.error('Error canceling inscription:', error);
  }
}

export { equipoTorneoModel, updateIdMP, cancelInscripcion };
