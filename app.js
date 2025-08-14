import express, { json } from 'express';
import cors from 'cors';
import { equipoRouter } from './routes/equipo.js';
import { torneoRouter } from './routes/torneo.js';
import { politicaRouter } from './routes/politica.js';
import { muroRouter } from './routes/muro.js';
import { canchaRouter } from './routes/cancha.js';
import { usuarioRouter } from './routes/usuario.js';
import { mercadoPagoRouter } from './routes/extras/mercadoPago.js';
import { partidoTorneoRouter } from './routes/partidoTorneo.js';
import { equipoUsuarioRouter } from './routes/equipoUsuario.js';
import { equipoTorneoRouter } from './routes/equipoTorneo.js';
import { turnoRouter } from './routes/turnos.js';
import { cronsController } from './controllers/extras/crons.js';

const app = express();

// Initial config
app.use(cors());
app.use(json());
app.disable('x-powered-by');

// Routes
app.use('/equipos', equipoRouter);
app.use('/torneos', torneoRouter);
app.use('/politicas', politicaRouter);
app.use('/muros', muroRouter);
app.use('/canchas', canchaRouter);
app.use('/usuarios', usuarioRouter);
app.use('/partidos', partidoTorneoRouter);
app.use('/equiposUsuarios', equipoUsuarioRouter);
app.use('/equiposTorneos', equipoTorneoRouter);
app.use('/turnos', turnoRouter);

// extras
app.use('/mercadopago', mercadoPagoRouter);

// default
app.get('/', (_, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Start crons
const startCrons = process.env.START_CRONS === 'true';

if (startCrons) {
  const crons = new cronsController(true);
  console.log('Crons working:');
  Object.entries(crons.getTasks()).forEach(([taskName, task]) => {
    console.log(`- ${taskName}`);
  });
  console.log('');
} else {
  console.log('Crons not working, check env variables');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

export default app;
