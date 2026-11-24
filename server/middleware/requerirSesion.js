import { verificarSesion } from '../services/cuentasService.js';
import { ErrorAnalisis } from '../utils/errores.js';

export async function requerirSesion(req, res, next) {
  const cabecera = req.headers.authorization ?? '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Necesitás iniciar sesión para usar esta función.',
      codigo: 'SIN_SESION',
    });
  }

  try {
    const usuario = await verificarSesion(token);

    if (!usuario) {
      return res.status(401).json({
        error: 'Tu sesión venció. Iniciá sesión de nuevo.',
        codigo: 'SESION_INVALIDA',
      });
    }

    req.usuario = { id: usuario.id, email: usuario.email };
    next();
  } catch (error) {
    if (error instanceof ErrorAnalisis) {
      return res.status(error.status).json({ error: error.message, codigo: error.codigo });
    }

    console.error('[Sesión] Error inesperado al verificar la sesión:', error);
    res.status(500).json({
      error: 'Ocurrió un error inesperado al verificar tu sesión.',
      codigo: 'ERROR_INTERNO',
    });
  }
}