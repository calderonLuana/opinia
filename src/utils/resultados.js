const SENTIMIENTOS = [
  { clave: 'positivo', nombre: 'Positivas', color: '#39c995' },
  { clave: 'neutro', nombre: 'Neutras', color: '#6485ff' },
  { clave: 'negativo', nombre: 'Negativas', color: '#f05b75' },
  { clave: 'mixto', nombre: 'Mixtas', color: '#f5a34b' },
];

// Datos del gráfico de un análisis (usa los porcentajes ya calculados)
export function datosSentimientos(sentimientos) {
  return SENTIMIENTOS.map(({ clave, nombre, color }) => ({
    name: nombre,
    value: Math.round(sentimientos[clave].porcentaje),
    color,
  }));
}

// Datos del gráfico a partir de cantidades de opiniones
export function datosSentimientosDesdeCantidades(cantidades, total) {
  return SENTIMIENTOS.map(({ clave, nombre, color }) => ({
    name: nombre,
    value: total > 0 ? Math.round((cantidades[clave] / total) * 100) : 0,
    color,
  }));
}

// Estadísticas generales del Dashboard, sobre todos los análisis del usuario
export function calcularEstadisticas(lista) {
  const cantidades = { positivo: 0, negativo: 0, neutro: 0, mixto: 0 };
  let totalOpiniones = 0;

  for (const item of lista) {
    totalOpiniones += item.resumen.totalOpiniones;
    for (const clave of Object.keys(cantidades)) {
      cantidades[clave] += item.resumen.sentimientos[clave]?.cantidad ?? 0;
    }
  }

  const porcentaje = (cantidad) =>
    totalOpiniones > 0 ? Math.round((cantidad / totalOpiniones) * 100) : 0;

  return {
    totalAnalisis: lista.length,
    totalOpiniones,
    positivo: porcentaje(cantidades.positivo),
    negativo: porcentaje(cantidades.negativo),
    sentimientos: datosSentimientosDesdeCantidades(cantidades, totalOpiniones),
  };
}

export function formatearFecha(fecha) {
  const [anio, mes, dia] = String(fecha).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : fecha;
}

export function formatearTema(tema) {
  const texto = String(tema).replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}