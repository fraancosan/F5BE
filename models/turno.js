import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';
import { canchaModel } from './cancha.js';
import { usuarioModel } from './Usuario.js';
import { v4, parse as uuidParse, stringify as uuidStringify } from 'uuid';

const turnosModel = db.define(
  'Turnos',
  {
    id: {
      type: DataTypes.BLOB(16),
      primaryKey: true,
      defaultValue() {
        return Buffer.from(uuidParse(v4()));
      },
      get() {
        const rawValue = this.getDataValue('id');
        return rawValue ? uuidStringify(rawValue) : null;
      },
      set(value) {
        const uuid = value || v4(); // si no se pasa, genera uno
        this.setDataValue('id', Buffer.from(uuidParse(uuid)));
      },
    },
    idCancha: {
      type: DataTypes.INTEGER,
      references: {
        model: canchaModel,
        key: 'id',
      },
      allowNull: false,
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      references: {
        model: usuarioModel,
        key: 'id',
      },
      allowNull: false,
    },
    idUsuarioCompartido: {
      type: DataTypes.INTEGER,
      references: {
        model: usuarioModel,
        key: 'id',
      },
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    precio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioSeña: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    buscandoRival: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
    },
    parrilla: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
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
    idMPCompartido: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    urlPreferenciaPago: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    urlPreferenciaPagoCompartido: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'Turnos',
    freezeTableName: false,
    timestamps: false,
  },
);

turnosModel.belongsTo(canchaModel, { foreignKey: 'idCancha', as: 'cancha' });
turnosModel.belongsTo(usuarioModel, { foreignKey: 'idUsuario', as: 'usuario' });
turnosModel.belongsTo(usuarioModel, {
  foreignKey: 'idUsuarioCompartido',
  as: 'usuarioCompartido',
});

async function updateIdMP({ id, idMP }) {
  try {
    await db.query(
      `
      UPDATE Turnos
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

async function updateIdMPCompartido({ id, idMP }) {
  try {
    await db.query(
      `
      UPDATE Turnos
      SET idMPCompartido = ?
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

async function cancelTurno() {}

async function cancelTurnoCompartido() {}

export {
  turnosModel,
  updateIdMP,
  updateIdMPCompartido,
  cancelTurno,
  cancelTurnoCompartido,
};
