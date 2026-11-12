import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analizarRouter from './routes/analizar.js';

const app = express();
const PORT = process.env.PORT || 3001;
const geminiConfigurada = Boolean(process.env.GEMINI_API_KEY?.trim());

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, geminiConfigurada });
});

app.use('/api/analizar', analizarRouter);

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
});