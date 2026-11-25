
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

// Crea un cliente que consulta Supabase con la sesión del usuario.
function obtenerClienteConSesion(token) {
  const url = process.env.SUPABASE_URL?.trim();
  const clave = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !clave) {
    throw new ErrorAnalisis(
      'Falta configurar el servicio de cuentas en el servidor.',
      500,
      'CONFIG_CUENTAS',
    );
  }

  return createClient(url, clave, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Devuelve el usuario de la sesión, o null si la sesión no es válida.
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

// Busca un análisis y comprueba que pertenece al usuario autenticado.
export async function obtenerAnalisisParaInforme(idAnalisis, token, usuarioId) {
  const clienteSesion = obtenerClienteConSesion(token);

  const { data, error } = await clienteSesion
    .from('analisis')
    .select('id, user_id, creado_en, evento, resumen, detalle')
    .eq('id', idAnalisis)
    .eq('user_id', usuarioId)
    .maybeSingle();

  if (error) {
    console.error('[Cuentas] Error al consultar el análisis:', {
      code: error.code,
      message: error.message,
    });

    throw new ErrorAnalisis(
      'No se pudo consultar el análisis. Intentá de nuevo en unos minutos.',
      500,
      'CONSULTA_ANALISIS',
    );
  }

  return data;
}
