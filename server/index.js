
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analizarRouter from './routes/analizar.js';
import importarRouter from './routes/importar.js';
import enviarInformeRouter from './routes/enviarInforme.js';
import { requerirSesion } from './middleware/requerirSesion.js';

const app = express();
const PORT = process.env.PORT || 3001;
const geminiConfigurada = Boolean(process.env.GEMINI_API_KEY?.trim());
const cuentasConfiguradas = Boolean(
  process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_PUBLISHABLE_KEY?.trim(),
);

app.use(
  cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '1mb' }));

// Pública: solo informa si el servidor está activo y configurado
app.get('/api/health', (req, res) => {
  res.json({ ok: true, geminiConfigurada, cuentasConfiguradas });
});

// Protegidas: requieren una sesión iniciada
app.use('/api/analizar', requerirSesion, analizarRouter);
app.use('/api/importar-sheets', requerirSesion, importarRouter);
app.use('/api/enviar-informe', requerirSesion, enviarInformeRouter);

// Rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Errores generales (por ejemplo, JSON mal formado)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: status === 400 ? 'La solicitud no es un JSON válido.' : 'Error interno del servidor.',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de OpinIA en http://localhost:${PORT}`);
  console.log(
    geminiConfigurada
      ? 'Gemini API Key: configurada'
      : '⚠️  Falta GEMINI_API_KEY en server/.env: el análisis con Gemini no va a funcionar.',
  );
  console.log(
    cuentasConfiguradas
      ? 'Servicio de cuentas: configurado'
      : '⚠️  Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY en server/.env: nadie va a poder usar el backend.',
  );
});
