import { Router } from 'express';
import { validarSolicitud } from '../utils/validarSolicitud.js';
import { analizarOpiniones } from '../services/analisisService.js';
import { ErrorAnalisis } from '../utils/errores.js';

const router = Router();

router.post('/', async (req, res) => {
  const { errores, datos } = validarSolicitud(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  }

  try {
    const resultado = await analizarOpiniones(datos);
    res.json({ ok: true, resultado });
  } catch (error) {
    if (error instanceof ErrorAnalisis) {
      return res.status(error.status).json({ error: error.message, codigo: error.codigo });
    }
    console.error('[Análisis] Error inesperado:', error);
    res.status(500).json({
      error: 'Ocurrió un error inesperado al analizar las opiniones.',
      codigo: 'ERROR_INTERNO',
    });
  }
});

export default router;