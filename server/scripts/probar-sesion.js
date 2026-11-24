const BASE = 'http://127.0.0.1:3001';
const TOKEN = process.env.TOKEN_PRUEBA;

let fallas = 0;

async function probar(titulo, { metodo = 'POST', ruta, token, cuerpo }, esperado) {
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: metodo === 'POST' ? JSON.stringify(cuerpo ?? {}) : undefined,
  });
  const datos = await respuesta.json().catch(() => ({}));

  const correcto = respuesta.status === esperado;
  if (!correcto) fallas += 1;

  console.log(
    `${correcto ? '✔' : '✘'} ${titulo} -> HTTP ${respuesta.status} (esperado ${esperado})` +
      (datos.codigo ? ` [${datos.codigo}]` : ''),
  );
}

await probar('1. Health sin sesión (pública)', { metodo: 'GET', ruta: '/api/health' }, 200);
await probar('2. Analizar sin sesión', { ruta: '/api/analizar' }, 401);
await probar('3. Importar planilla sin sesión', { ruta: '/api/importar-sheets' }, 401);
await probar(
  '4. Analizar con una sesión inventada',
  { ruta: '/api/analizar', token: 'token-inventado' },
  401,
);

if (TOKEN) {
  await probar(
    '5. Importar con sesión válida y enlace inválido (llega a la validación)',
    { ruta: '/api/importar-sheets', token: TOKEN, cuerpo: { enlace: 'esto-no-es-un-enlace' } },
    400,
  );
  await probar(
    '6. Analizar con sesión válida y datos vacíos (llega a la validación)',
    { ruta: '/api/analizar', token: TOKEN, cuerpo: {} },
    400,
  );
} else {
  console.log('\nSin TOKEN_PRUEBA: se omiten las pruebas 5 y 6 (con sesión válida).');
}

console.log(fallas === 0 ? '\nTodo correcto.' : `\n${fallas} prueba(s) fallaron.`);
process.exitCode = fallas === 0 ? 0 : 1;