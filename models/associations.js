import equipoModel from './equipo.js';
import torneoModel from './torneo.js';

// Definición de la relación muchos a muchos entre Torneo y Equipo
torneoModel.belongsToMany(equipoModel, {
  through: 'equipostorneos',
  foreignKey: 'idTorneo',
  timestamps: false,
});

equipoModel.belongsToMany(torneoModel, {
  through: 'equipostorneos',
  foreignKey: 'idEquipo',
  timestamps: false,
});
