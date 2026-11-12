
const URL = 'http://localhost:3001/api/analizar';

const valido = {
  nombre: 'Congreso de Tecnología 2025',
  tipo: 'Congreso',
  fecha: '2025-04-15',
  institucion: 'Tech Events',
  opiniones: [
    'Las exposiciones fueron excelentes y los disertantes demostraron un gran conocimiento.',
    'La acreditación fue demasiado lenta y se generaron largas filas.',
    'Las exposiciones fueron interesantes, pero la organización de los horarios fue bastante desordenada.',
    'El congreso se realizó durante dos jornadas.',
  ],
};

async function probar(titulo, body) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log(`\n${titulo} -> HTTP ${res.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`\n${titulo} -> Error de conexión`);
    console.error(error.message);
  }
}

await probar('1. Solicitud válida (espera 200)', valido);

await probar(
  '2. Sin nombre y tipo inválido (espera 400)',
  { ...valido, nombre: '', tipo: 'Fiesta' }
);

await probar(
  '3. Opiniones vacías (espera 400)',
  { ...valido, opiniones: ['   ', ''] }
);
