
import { supabase } from '../lib/supabase';

const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.';

async function obtenerToken() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Tu sesión venció. Iniciá sesión de nuevo.');
  }

  return token;
}

async function enviarJSON(ruta, datos, { tiempoMaximo, mensajeTiempo }) {
  const token = await obtenerToken();
  let respuesta;

  try {
    respuesta = await fetch(ruta, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
      signal: AbortSignal.timeout(tiempoMaximo),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error(mensajeTiempo, { cause: error });
    }

    throw new Error(MENSAJE_SIN_CONEXION, { cause: error });
  }

  let cuerpo = null;

  try {
    cuerpo = await respuesta.json();
  } catch {
    // La respuesta no trae JSON.
  }

  if (!respuesta.ok) {
    if (!cuerpo) {
      throw new Error(MENSAJE_SIN_CONEXION);
    }

    throw new Error(
      cuerpo.detalles?.join(' ') ||
        cuerpo.error ||
        'No se pudo completar la solicitud.',
    );
  }

  return cuerpo;
}

export async function analizarOpiniones(datos) {
  const cuerpo = await enviarJSON('/api/analizar', datos, {
    tiempoMaximo: 90000,
    mensajeTiempo:
      'El análisis está tardando demasiado. Intentá de nuevo con menos opiniones.',
  });

  return cuerpo.resultado;
}

export async function importarDesdeSheets(enlace) {
  const cuerpo = await enviarJSON(
    '/api/importar-sheets',
    { enlace },
    {
      tiempoMaximo: 30000,
      mensajeTiempo:
        'Google Sheets tardó demasiado en responder. Intentá de nuevo.',
    },
  );

  return cuerpo.csv;
}

export async function enviarInforme(idAnalisis) {
  const cuerpo = await enviarJSON(
    '/api/enviar-informe',
    { idAnalisis },
    {
      tiempoMaximo: 30000,
      mensajeTiempo:
        'El envío del informe está tardando demasiado. Intentá de nuevo.',
    },
  );

  return cuerpo;
}
