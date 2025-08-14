import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';

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

async function getCantidadMiembros(id) {
  const [result] = await db.query(
    'SELECT COUNT(*) as cantidad FROM EquiposUsuarios WHERE idEquipo = ?',
    {
      replacements: [id],
      type: QueryTypes.SELECT,
    },
  );
  if (!result || !result.cantidad) {
    return 0;
  } else {
    return result.cantidad;
  }
}

export { equipoModel, getCantidadMiembros };
