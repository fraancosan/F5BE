import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';

const torneoModel = db.define(
  'Torneos',
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

async function getCantidadEquipos(id) {
  const [result] = await db.query(
    'SELECT COUNT(*) as cantidad FROM EquiposTorneos WHERE idTorneo = ?',
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

export { torneoModel, getCantidadEquipos };
