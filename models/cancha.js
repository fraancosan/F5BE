import db from '../database/connection.js';
import { DataTypes } from 'sequelize';

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

export default canchaModel;
