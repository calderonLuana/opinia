const SENTIMIENTOS = ['positivo', 'negativo', 'neutro', 'mixto'];
const CAMPOS_LISTA = ['aspectosPositivos', 'problemasDetectados', 'recomendaciones'];

export function parsearRespuesta(textoJson) {
  const limpio = String(textoJson ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  try {
    return JSON.parse(limpio);
  } catch {
    return null;
  }
}

function esListaDeTextos(valor) {
  return Array.isArray(valor) && valor.every((v) => typeof v === 'string');
}

export function validarRespuesta(respuesta, opinionesEnviadas) {
  const errores = [];

  if (!respuesta || typeof respuesta !== 'object' || Array.isArray(respuesta)) {
    return { errores: ['La respuesta no es un objeto JSON válido.'] };
  }

  for (const campo of CAMPOS_LISTA) {
    if (!esListaDeTextos(respuesta[campo])) {
      errores.push(`El campo ${campo} debe ser una lista de textos.`);
    }
  }

  const temasValidos =
    Array.isArray(respuesta.temasFrecuentes) &&
    respuesta.temasFrecuentes.every(
      (t) => t && typeof t.nombre === 'string' && typeof t.descripcion === 'string',
    );
  if (!temasValidos) {
    errores.push('El campo temasFrecuentes no tiene el formato esperado.');
  }

  if (!Array.isArray(respuesta.opiniones)) {
    errores.push('Falta la lista de opiniones clasificadas.');
    return { errores };
  }

  const idsEnviados = new Set(opinionesEnviadas.map((o) => o.id));
  const idsRecibidos = new Set();

  for (const op of respuesta.opiniones) {
    if (!op || !Number.isInteger(op.id) || !idsEnviados.has(op.id)) {
      errores.push(`Hay una opinión con un id que no corresponde (${op?.id}).`);
      continue;
    }
    if (idsRecibidos.has(op.id)) {
      errores.push(`El id ${op.id} está repetido.`);
      continue;
    }
    idsRecibidos.add(op.id);

    if (!SENTIMIENTOS.includes(op.sentimiento)) {
      errores.push(`La opinión ${op.id} tiene un sentimiento no permitido.`);
    }
    if (typeof op.tema !== 'string' || !op.tema.trim()) {
      errores.push(`La opinión ${op.id} no tiene tema.`);
    }
    if (typeof op.justificacion !== 'string') {
      errores.push(`La opinión ${op.id} no tiene justificación.`);
    }
  }

  if (idsRecibidos.size !== opinionesEnviadas.length) {
    errores.push(
      `Se recibieron ${idsRecibidos.size} de ${opinionesEnviadas.length} opiniones.`,
    );
  }

  return { errores };
}