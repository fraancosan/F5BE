import cron from 'node-cron';
import { cancelTurno, cancelTurnoCompartido } from '../../models/turno.js';
import { cancelInscripcion } from '../../models/equipoTorneo.js';

export class cronsController {
  constructor(autoStart = true) {
    this.tasks = {
      'cancel-turno': cron.schedule(
        '*/5 * * * *',
        () => {
          cancelTurno();
        },
        {
          scheduled: autoStart,
          name: 'cancel-turno',
        },
      ),
      'cancel-turno-compartido': cron.schedule(
        '*/5 * * * *',
        () => {
          cancelTurnoCompartido();
        },
        {
          scheduled: autoStart,
          name: 'cancel-turno-compartido',
        },
      ),

      'cancel-inscripcion': cron.schedule(
        '*/5 * * * *',
        () => {
          cancelInscripcion();
        },
        {
          scheduled: autoStart,
          name: 'cancel-inscripcion',
        },
      ),
    };
  }

  startSingleTask(taskName) {
    this.tasks[taskName].start();
  }

  start() {
    Object.values(this.tasks).forEach((task) => task.start());
  }

  stop() {
    Object.values(this.tasks).forEach((task) => task.stop());
  }

  getTasks() {
    return this.tasks;
  }
}
