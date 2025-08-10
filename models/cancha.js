import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';

const canchaModel = db.define(
  'Canchas',
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

async function getAvailableCanchas(fecha, hora) {
  try {
    const result = await db.query(
      `
      SELECT c.id FROM Canchas c
      WHERE c.id NOT IN (
        SELECT ca.id FROM Turnos t
        JOIN Canchas ca ON t.idCancha = ca.id
        WHERE t.fecha = ? AND t.hora = ?
      ) AND c.disponible = 1`,
      {
        replacements: [fecha, hora],
        type: QueryTypes.SELECT,
      },
    );
    return result;
  } catch (error) {
    return [];
  }
}

export { canchaModel, getAvailableCanchas };
