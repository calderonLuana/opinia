
import { Router } from 'express';
import { obtenerAnalisisParaInforme } from '../services/cuentasService.js';
import { enviarInformePorCorreo } from '../services/informeEmailService.js';
import { ErrorAnalisis } from '../utils/errores.js';

const router = Router();

const UUID_VALIDO =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.post('/', async (req, res) => {
  const { idAnalisis } = req.body ?? {};

  if (typeof idAnalisis !== 'string' || !UUID_VALIDO.test(idAnalisis)) {
    return res.status(400).json({
      error: 'El identificador del análisis no es válido.',
      codigo: 'ID_INVALIDO',
    });
  }

  if (!req.usuario?.id || !req.usuario?.email) {
    return res.status(401).json({
      error: 'No se pudo identificar tu cuenta. Iniciá sesión nuevamente.',
      codigo: 'SESION_INVALIDA',
    });
  }

  try {
    const cabecera = req.headers.authorization ?? '';
    const token = cabecera.split(' ')[1];

    const analisis = await obtenerAnalisisParaInforme(
      idAnalisis,
      token,
      req.usuario.id,
    );

    if (!analisis) {
      return res.status(404).json({
        error: 'No se encontró el análisis solicitado.',
        codigo: 'ANALISIS_NO_ENCONTRADO',
      });
    }

    await enviarInformePorCorreo(analisis, req.usuario.email);

    return res.json({
      ok: true,
      mensaje: 'La solicitud de envío fue recibida. Revisá tu correo en unos instantes.',
    });
  } catch (error) {
    if (error instanceof ErrorAnalisis) {
      return res.status(error.status).json({
        error: error.message,
        codigo: error.codigo,
      });
    }

    console.error('[Informe] Error inesperado:', error);

    return res.status(500).json({
      error: 'Ocurrió un error inesperado al enviar el informe.',
      codigo: 'ERROR_INTERNO',
    });
  }
});

export default router;
