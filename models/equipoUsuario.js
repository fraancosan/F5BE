import db from '../database/connection.js';
import { DataTypes } from 'sequelize';
import equipoModel from './equipo.js';
import { usuarioModel } from './Usuario.js';

const equipoUsuarioModel = db.define(
  'EquiposUsuarios',
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
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: usuarioModel,
        key: 'id',
      },
    },
    capitan: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
  },
);

equipoUsuarioModel.belongsTo(equipoModel, {
  foreignKey: 'idEquipo',
  as: 'Equipo',
});

equipoUsuarioModel.belongsTo(usuarioModel, {
  foreignKey: 'idUsuario',
  as: 'Usuario',
});

export default equipoUsuarioModel;
