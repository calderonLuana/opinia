export async function analizarOpiniones(datos) {
  let respuesta;

  try {
    respuesta = await fetch('/api/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      signal: AbortSignal.timeout(90000),
    });
  } catch (error) {
  if (error.name === 'TimeoutError') {
    throw new Error(
      'El análisis está tardando demasiado. Intentá de nuevo con menos opiniones.',
      { cause: error }
    );
  }

  throw new Error(
    'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.',
    { cause: error }
  );
}

  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
 } catch (error) {
  // La respuesta no trae JSON (por ejemplo, el backend está caído)
  console.error('No se pudo interpretar la respuesta del servidor:', error);
}

  if (!respuesta.ok) {
    if (!cuerpo) {
      throw new Error(
        'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.',
      );
    }
    throw new Error(
      cuerpo.detalles?.join(' ') || cuerpo.error || 'No se pudo completar el análisis.',
    );
  }

  return cuerpo.resultado;
}