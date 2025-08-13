import { equipoModel } from './equipo.js';
import { torneoModel } from './torneo.js';
import { equipoTorneoModel } from './equipoTorneo.js'; // El modelo que creaste recien

// Definición de la relación muchos a muchos entre Torneo y Equipo
torneoModel.belongsToMany(equipoModel, {
  through: equipoTorneoModel,
  foreignKey: 'idTorneo',
  timestamps: false,
});

equipoModel.belongsToMany(torneoModel, {
  through: equipoTorneoModel,
  foreignKey: 'idEquipo',
  timestamps: false,
});

// Relaciones directas
equipoTorneoModel.belongsTo(equipoModel, {
  foreignKey: 'idEquipo',
  as: 'equipo',
});

equipoTorneoModel.belongsTo(torneoModel, {
  foreignKey: 'idTorneo',
  as: 'torneo',
});

equipoModel.hasMany(equipoTorneoModel, {
  foreignKey: 'idEquipo',
  as: 'inscripcionesTorneos',
});

torneoModel.hasMany(equipoTorneoModel, {
  foreignKey: 'idTorneo',
  as: 'equiposInscritos',
});
