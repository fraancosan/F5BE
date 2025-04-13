import db from "../database/connection.js";
import { DataTypes } from "sequelize";
import  canchaModel  from "./cancha.js";
import  usuarioModel  from "./Usuario.js";


const turnoModel = db.define("turno", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idCancha:{
        type: DataTypes.INTEGER,
        references: {
            model: canchaModel,
            key: "id",
        },
        allowNull: false,
    },
    idUsuario:{
        type: DataTypes.INTEGER,
        references: {
            model: usuarioModel,
            key: "id",
        },
        allowNull: false,
    },
    idUsuarioCompartido:{
        type: DataTypes.INTEGER,
        references: {
            model: usuarioModel,
            key: "id",
        },
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATE,
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
    buscandoRival: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
    },
    parrilla:{
        type: DataTypes.INTEGER(1),
        allowNull: false,
    }
}, {
    tableName: "Turnos",
    freezeTableName: false,
    timestamps: false,
});

export default turnoModel;