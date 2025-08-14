import db from '../database/connection.js';
import { DataTypes, QueryTypes } from 'sequelize';
import { canchaModel } from './cancha.js';
import { usuarioModel } from './Usuario.js';
import { v4, parse as uuidParse, stringify as uuidStringify } from 'uuid';
import { sendEmail } from '../utils/nodemailer.js';
import { getLocalDate } from '../utils/common.js';

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
    fechaUsuarioCompartido: {
      type: DataTypes.DATE,
      allowNull: true,
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

async function cancelTurno() {
  const date = new Date();
  const timeLimit = process.env.MP_TIME ?? 30;

  try {
    await db.query(
      `
      UPDATE Turnos
      SET estado = 'cancelado'
      WHERE 
        idMP IS NULL
        AND
        TIMESTAMPDIFF(MINUTE, fechaCreacion, ?) >= ?
      `,
      {
        replacements: [date, timeLimit],
        type: QueryTypes.UPDATE,
      },
    );
  } catch (error) {
    console.error('Error canceling turno:', error);
  }
}

async function cancelTurnoCompartido() {
  const date = new Date();
  const timeLimit = process.env.MP_TIME ?? 30;

  try {
    await db.query(
      `
      UPDATE Turnos
      SET 
        idMPCompartido = NULL, 
        idUsuarioCompartido = NULL, 
        fechaUsuarioCompartido = NULL, 
        urlPreferenciaPagoCompartido = NULL
      WHERE 
        idMPCompartido IS NULL
        AND buscandoRival = 1
        AND idUsuarioCompartido IS NOT NULL
        AND TIMESTAMPDIFF(MINUTE, fechaUsuarioCompartido, ?) >= ?
      `,
      {
        replacements: [date, timeLimit],
        type: QueryTypes.UPDATE,
      },
    );
  } catch (error) {
    console.error('Error canceling turno:', error);
  }
}

async function sendEmailNotification() {
  const fecha = getLocalDate();

  try {
    const emails = await db.query(
      `
      SELECT u.mail
      FROM Turnos t
      JOIN Usuarios u ON t.idUsuario = u.id
      WHERE 
        t.estado = 'señado'
        AND TIMESTAMPDIFF(DAY, ?, t.fecha) = 1
      `,
      {
        replacements: [fecha],
        type: QueryTypes.SELECT,
      },
    );
    if (emails.length > 0) {
      const emailList = emails.map((email) => email.mail).join(', ');
      const subject = 'Recordatorio de Turno';
      const text = `Estimado usuario, le recordamos que tiene un turno agendado para mañana.`;
      const html = `<p>Estimado usuario, le recordamos que tiene un turno agendado para <b>mañana</b>.</p>`;
      await sendEmail({ email: emailList, subject, text, html });
      console.log(`Se han enviado ${emails.length} notificaciones`);
    } else {
      console.log('No hay turnos agendados para mañana.');
    }
  } catch (error) {
    console.error('Sending email notification:', error);
  }
}

export {
  turnosModel,
  updateIdMP,
  updateIdMPCompartido,
  cancelTurno,
  cancelTurnoCompartido,
  sendEmailNotification,
};
