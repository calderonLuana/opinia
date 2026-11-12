const SENTIMIENTOS = ['positivo', 'negativo', 'neutro', 'mixto'];
const MAX_TEMAS = 8;

export function normalizarTema(tema) {
  return String(tema)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function porcentaje(cantidad, total) {
  return Math.round((cantidad / total) * 1000) / 10;
}

function limpiarLista(lista) {
  return lista.map((t) => t.trim()).filter((t) => t.length > 0);
}

export function construirResultado(datos, respuesta) {
  const total = datos.opiniones.length;
  const textoPorId = new Map(datos.opiniones.map((o) => [o.id, o.texto]));

  const opiniones = respuesta.opiniones
    .map((op) => ({
      id: op.id,
      texto: textoPorId.get(op.id),
      sentimiento: op.sentimiento,
      tema: normalizarTema(op.tema),
      justificacion: op.justificacion.trim(),
    }))
    .sort((a, b) => a.id - b.id);

  const sentimientos = {};
  for (const s of SENTIMIENTOS) {
    const cantidad = opiniones.filter((o) => o.sentimiento === s).length;
    sentimientos[s] = { cantidad, porcentaje: porcentaje(cantidad, total) };
  }

  const conteo = new Map();
  for (const o of opiniones) {
    conteo.set(o.tema, (conteo.get(o.tema) ?? 0) + 1);
  }

  const descripciones = new Map(
    respuesta.temasFrecuentes.map((t) => [normalizarTema(t.nombre), t.descripcion.trim()]),
  );

  const temasFrecuentes = [...conteo.entries()]
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: porcentaje(cantidad, total),
      descripcion: descripciones.get(nombre) ?? '',
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, MAX_TEMAS);

  return {
    evento: datos.evento,
    resumen: { totalOpiniones: total, sentimientos },
    opiniones,
    temasFrecuentes,
    aspectosPositivos: limpiarLista(respuesta.aspectosPositivos),
    problemasDetectados: limpiarLista(respuesta.problemasDetectados),
    recomendaciones: limpiarLista(respuesta.recomendaciones),
  };
}