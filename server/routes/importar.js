import { Router } from 'express';
import { descargarPlanilla } from '../utils/googleSheets.js';
import { ErrorAnalisis } from '../utils/errores.js';

const router = Router();

router.post('/', async (req, res) => {
  const enlace = req.body?.enlace;

  if (typeof enlace !== 'string' || !enlace.trim()) {
    return res.status(400).json({
      error: 'Pegá el enlace de la planilla de Google Sheets.',
      codigo: 'ENLACE_INVALIDO',
    });
  }

  try {
    const csv = await descargarPlanilla(enlace);
    res.json({ ok: true, csv });
  } catch (error) {
    if (error instanceof ErrorAnalisis) {
      return res.status(error.status).json({ error: error.message, codigo: error.codigo });
    }
    console.error('[Importar] Error inesperado:', error);
    res.status(500).json({
      error: 'Ocurrió un error inesperado al importar la planilla.',
      codigo: 'ERROR_INTERNO',
    });
  }
});

export default router;