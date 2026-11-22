import { ErrorAnalisis } from './errores.js';

const MAX_BYTES = 2 * 1024 * 1024;
const TIEMPO_MAXIMO_MS = 15000;

const MENSAJE_ACCESO =
  'No se pudo acceder a la planilla. Compartila como «Cualquier persona con el enlace» (lector) y volvé a intentar.';

export function construirUrlExportacion(enlace) {
  let url;

  try {
    url = new URL(String(enlace).trim());
  } catch {
    throw new ErrorAnalisis(
      'El enlace no es válido. Pegá la dirección completa de la planilla de Google Sheets.',
      400,
      'ENLACE_INVALIDO',
    );
  }

  const coincide = url.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);

  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !coincide) {
    throw new ErrorAnalisis(
      'El enlace debe ser de una planilla de Google Sheets (docs.google.com/spreadsheets).',
      400,
      'ENLACE_INVALIDO',
    );
  }

  const id = coincide[1];

  if (id === 'e') {
    throw new ErrorAnalisis(
      'Ese enlace corresponde a «Publicar en la web». Usá el enlace de «Compartir» de la planilla.',
      400,
      'ENLACE_INVALIDO',
    );
  }

  const gid = url.searchParams.get('gid') ?? url.hash.match(/gid=(\d+)/)?.[1] ?? '';
  const parametros = new URLSearchParams({ format: 'csv' });

  if (/^\d+$/.test(gid)) {
    parametros.set('gid', gid);
  }

  return `https://docs.google.com/spreadsheets/d/${id}/export?${parametros.toString()}`;
}

async function leerConLimite(respuesta) {
  const lector = respuesta.body.getReader();
  const partes = [];
  let total = 0;

  while (true) {
    const { done, value } = await lector.read();
    if (done) break;

    total += value.byteLength;
    if (total > MAX_BYTES) {
      await lector.cancel();
      throw new ErrorAnalisis(
        'La planilla supera los 2 MB. Usá una planilla más chica o dividila.',
        400,
        'PLANILLA_GRANDE',
      );
    }

    partes.push(value);
  }

  return Buffer.concat(partes).toString('utf-8');
}

export async function descargarPlanilla(enlace) {
  const urlExportacion = construirUrlExportacion(enlace);
  let respuesta;

  try {
    respuesta = await fetch(urlExportacion, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new ErrorAnalisis(
        'Google Sheets tardó demasiado en responder. Intentá de nuevo.',
        504,
        'PLANILLA_TIEMPO',
      );
    }
    throw new ErrorAnalisis('No se pudo conectar con Google Sheets.', 502, 'PLANILLA_CONEXION');
  }

  const host = new URL(respuesta.url).hostname;
  const hostValido = host === 'docs.google.com' || host.endsWith('.googleusercontent.com');
  const tipo = respuesta.headers.get('content-type') ?? '';

  if (
    !hostValido ||
    respuesta.status === 401 ||
    respuesta.status === 403 ||
    tipo.includes('text/html')
  ) {
    throw new ErrorAnalisis(MENSAJE_ACCESO, 400, 'PLANILLA_PRIVADA');
  }

  if (respuesta.status === 404) {
    throw new ErrorAnalisis('No se encontró la planilla. Revisá el enlace.', 400, 'PLANILLA_INEXISTENTE');
  }

  if (!respuesta.ok) {
    throw new ErrorAnalisis(
      'Google Sheets no devolvió la planilla. Intentá de nuevo.',
      502,
      'PLANILLA_ERROR',
    );
  }

  const csv = await leerConLimite(respuesta);

  if (!csv.trim()) {
    throw new ErrorAnalisis('La planilla está vacía.', 400, 'PLANILLA_VACIA');
  }

  return csv;
}