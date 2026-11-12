const TIPOS_PERMITIDOS = ['Congreso', 'Conferencia', 'Jornada', 'Seminario', 'Otro'];
const MAX_OPINIONES = 200;
const MAX_LARGO_OPINION = 1000;
const MAX_LARGO_TEXTO = 150;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function validarSolicitud(body) {
  const errores = [];

  if (!body || typeof body !== 'object') {
    return { errores: ['El cuerpo de la solicitud es inválido.'] };
  }

  const nombre = texto(body.nombre);
  const tipo = texto(body.tipo);
  const fecha = texto(body.fecha);
  const institucion = texto(body.institucion);

  if (!nombre) errores.push('El nombre del evento es obligatorio.');
  if (nombre.length > MAX_LARGO_TEXTO) errores.push('El nombre del evento es demasiado largo.');

  if (!TIPOS_PERMITIDOS.includes(tipo)) {
    errores.push(`El tipo de evento debe ser uno de: ${TIPOS_PERMITIDOS.join(', ')}.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    errores.push('La fecha debe tener el formato AAAA-MM-DD.');
  }

  if (institucion.length > MAX_LARGO_TEXTO) errores.push('La institución es demasiado larga.');

  let opiniones = [];
  if (!Array.isArray(body.opiniones)) {
    errores.push('Las opiniones deben enviarse como una lista.');
  } else {
    opiniones = body.opiniones.map(texto).filter((t) => t.length > 0);

    if (opiniones.length === 0) {
      errores.push('Ingresá al menos una opinión.');
    }
    if (opiniones.length > MAX_OPINIONES) {
      errores.push(`Se permiten hasta ${MAX_OPINIONES} opiniones por análisis.`);
    }
    if (opiniones.some((t) => t.length > MAX_LARGO_OPINION)) {
      errores.push(`Cada opinión puede tener hasta ${MAX_LARGO_OPINION} caracteres.`);
    }
  }

  if (errores.length > 0) return { errores };

  return {
    errores: [],
    datos: {
      evento: { nombre, tipo, fecha, institucion },
      opiniones: opiniones.map((t, i) => ({ id: i + 1, texto: t })),
    },
  };
}