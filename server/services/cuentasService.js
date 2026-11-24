import { createClient } from '@supabase/supabase-js';
import { ErrorAnalisis } from '../utils/errores.js';

let cliente = null;

function obtenerCliente() {
  const url = process.env.SUPABASE_URL?.trim();
  const clave = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !clave) {
    throw new ErrorAnalisis(
      'Falta configurar el servicio de cuentas en el servidor.',
      500,
      'CONFIG_CUENTAS',
    );
  }

  if (!cliente) {
    cliente = createClient(url, clave, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cliente;
}

// Devuelve el usuario de la sesión, o null si la sesión no es válida
export async function verificarSesion(token) {
  const { data, error } = await obtenerCliente().auth.getUser(token);

 if (error) {
  console.error('[Cuentas] Supabase rechazó la sesión:', {
    name: error.name,
    status: error.status,
    code: error.code,
    message: error.message,
  });

  const fallaDelServicio =
    error.name === 'AuthRetryableFetchError' || (error.status ?? 0) >= 500;

  if (fallaDelServicio) {
    console.error('[Cuentas] No se pudo verificar la sesión:', error.message);
    throw new ErrorAnalisis(
      'No se pudo verificar tu sesión. Intentá de nuevo en unos minutos.',
      502,
      'SESION_ERROR',
    );
  }

  return null;
}


  return data.user ?? null;
}