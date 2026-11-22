const SENTIMIENTOS = [
  { clave: 'positivo', nombre: 'Positivas', color: '#39c995' },
  { clave: 'neutro', nombre: 'Neutras', color: '#6485ff' },
  { clave: 'negativo', nombre: 'Negativas', color: '#f05b75' },
  { clave: 'mixto', nombre: 'Mixtas', color: '#f5a34b' },
];

export function datosSentimientos(sentimientos) {
  return SENTIMIENTOS.map(({ clave, nombre, color }) => ({
    name: nombre,
    value: Math.round(sentimientos[clave].porcentaje),
    color,
  }));
}

export function formatearFecha(fecha) {
  const [anio, mes, dia] = String(fecha).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : fecha;
}

export function formatearTema(tema) {
  const texto = String(tema).replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}