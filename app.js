import express, { json } from 'express';
import cors from 'cors';
import { equipoRouter } from './routes/equipo.js';
import { torneoRouter } from './routes/torneo.js';
import { politicaRouter } from './routes/politica.js';
import { muroRouter } from './routes/muro.js';
import { canchaRouter } from './routes/cancha.js';

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
app.get('/', (_, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

export default app;
