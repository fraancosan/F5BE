import db from '../database/connection.js';
import { getLocalDate } from '../utils/common.js';
import { mercadoPagoController } from './extras/mercadoPago.js';
import { equipoTorneoModel } from '../models/equipoTorneo.js';
import { isCaptain } from '../models/equipoUsuario.js';
import { equipoModel, getCantidadMiembros } from '../models/equipo.js';
import { torneoModel, getCantidadEquipos } from '../models/torneo.js';

export class equipoTorneoController {
  static async addTorneo(req, res) {
    const t = await db.transaction();
    try {
      const { idEquipo, idTorneo } = req.params;
      const equipo = await equipoModel.findByPk(idEquipo);
      const torneo = await torneoModel.findByPk(idTorneo);

      if (!equipo || !torneo) {
        const error = new Error('Equipo o torneo no encontrado');
        error.status = 404;
        throw error;
      } else if (!(await isCaptain(equipo.id, req.user.id))) {
        const error = new Error('No tienes permisos para inscribirte');
        error.status = 403;
        throw error;
      } else if (torneo.fechaInicio <= getLocalDate()) {
        const error = new Error(
          'El torneo ya ha comenzado o está por comenzar',
        );
        error.status = 400;
        throw error;
      } else if (
        torneo.cantidadEquipos <= (await getCantidadEquipos(torneo.id))
      ) {
        const error = new Error(
          'El torneo ya ha alcanzado su capacidad máxima',
        );
        error.status = 400;
        throw error;
      } else if ((await getCantidadMiembros(equipo.id)) < 5) {
        const error = new Error(
          'El equipo no tiene suficientes miembros (mínimo 5)',
        );
        error.status = 400;
        throw error;
      }
      const equipoTorneo = await equipoTorneoModel.create({
        idEquipo: equipo.id,
        idTorneo: torneo.id,
      });
      const preference = await mercadoPagoController.createPreference({
        title: `Torneo: ${torneo.descripcion} - Equipo: ${equipo.nombre}`,
        precio: torneo.precioInscripcion,
        idReferencia: `${equipoTorneo.id}-E${equipo.id}T${torneo.id}`,
        endPoint: 'equipo-torneo',
      });

      await equipoTorneo.update(
        { urlPreferenciaPago: preference.init_point },
        { transaction: t },
      );
      t.commit();
      res.status(200).json(equipoTorneo);
    } catch (error) {
      t.rollback();
      if (error.status) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error(error);
        res
          .status(500)
          .json({ message: 'Error al agregar el torneo al equipo' });
      }
    }
  }
}
