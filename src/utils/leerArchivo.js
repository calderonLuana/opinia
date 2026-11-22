import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const MAX_RESPUESTAS = 200;
export const MAX_LARGO_OPINION = 2000;
export const EXTENSIONES_PERMITIDAS = ['csv', 'xlsx', 'xls'];

const MENSAJE_ARCHIVO_INVALIDO =
  'No se pudo leer la planilla. Necesita una fila de encabezados y al menos una respuesta.';

export function obtenerExtension(archivo) {
  const partes = archivo.name.toLowerCase().split('.');
  return partes.length > 1 ? partes.pop() : '';
}

async function leerTexto(archivo) {
  const buffer = await archivo.arrayBuffer();
  let texto = new TextDecoder('utf-8').decode(buffer);
  // Excel en español suele guardar los CSV en Windows-1252
  if (texto.includes('\uFFFD')) {
    texto = new TextDecoder('windows-1252').decode(buffer);
  }
  return texto;
}

function textoDeCelda(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function leerCSVDesdeTexto(texto) {
  const resultado = Papa.parse(texto, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (encabezado) => encabezado.trim(),
  });

  const columnas = (resultado.meta.fields ?? []).filter((c) => c.length > 0);
  return { columnas, filas: resultado.data };
}

// Convierte una matriz (primera fila = encabezados) en columnas y filas
function matrizAColumnasYFilas(matriz) {
  if (!matriz || matriz.length < 2) return { columnas: [], filas: [] };

  const columnas = [];
  const posiciones = [];
  const usados = new Set();

  matriz[0].forEach((celda, posicion) => {
    const nombre = textoDeCelda(celda);
    if (!nombre) return;

    let candidato = nombre;
    let numero = 2;
    while (usados.has(candidato)) {
      candidato = `${nombre} (${numero})`;
      numero += 1;
    }

    usados.add(candidato);
    columnas.push(candidato);
    posiciones.push(posicion);
  });

  const filas = matriz
    .slice(1)
    .map((fila) => {
      const objeto = {};
      columnas.forEach((nombre, i) => {
        objeto[nombre] = textoDeCelda(fila[posiciones[i]]);
      });
      return objeto;
    })
    .filter((objeto) => Object.values(objeto).some((valor) => valor !== ''));

  return { columnas, filas };
}

async function leerExcel(archivo) {
  let matriz;

  try {
    const buffer = await archivo.arrayBuffer();
    const libro = XLSX.read(buffer, { type: 'array' });
    const nombreHoja = libro.SheetNames[0];
    if (!nombreHoja) return { columnas: [], filas: [] };

    matriz = XLSX.utils.sheet_to_json(libro.Sheets[nombreHoja], {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    });
  } catch {
    throw new Error(
      'No se pudo leer el archivo Excel. Verificá que no esté dañado ni protegido con contraseña.',
    );
  }

  return matrizAColumnasYFilas(matriz);
}

function validarPlanilla(resultado) {
  if (resultado.columnas.length === 0 || resultado.filas.length === 0) {
    throw new Error(MENSAJE_ARCHIVO_INVALIDO);
  }
  return resultado;
}

// Archivos CSV, XLSX o XLS seleccionados desde el equipo
export async function leerArchivo(archivo) {
  const extension = obtenerExtension(archivo);

  if (extension === 'csv') {
    return validarPlanilla(leerCSVDesdeTexto(await leerTexto(archivo)));
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return validarPlanilla(await leerExcel(archivo));
  }

  throw new Error('Formato de archivo no permitido.');
}

// Contenido CSV descargado desde una planilla de Google Sheets
export function leerPlanilla(textoCSV) {
  return validarPlanilla(leerCSVDesdeTexto(textoCSV));
}

function pareceDato(valor) {
  return (
    /^\S+@\S+\.\S+$/.test(valor) ||
    /^-?\d+([.,]\d+)?$/.test(valor) ||
    /^\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}/.test(valor)
  );
}

// Preselecciona las columnas de texto libre (no correos, números ni fechas)
export function detectarColumnasDeTexto(columnas, filas) {
  return columnas.filter((columna) => {
    const valores = filas
      .map((fila) => String(fila[columna] ?? '').trim())
      .filter((v) => v.length > 0);

    if (valores.length === 0) return false;

    const esDato = valores.filter(pareceDato).length > valores.length / 2;
    const promedio = valores.reduce((suma, v) => suma + v.length, 0) / valores.length;

    return !esDato && promedio >= 20;
  });
}

// Una opinión por fila, combinando las columnas elegidas
export function construirOpiniones(filas, columnas) {
  const opiniones = [];

  for (const fila of filas) {
    const partes = columnas
      .map((columna) => ({ columna, valor: String(fila[columna] ?? '').trim() }))
      .filter((parte) => parte.valor.length > 0);

    if (partes.length === 0) continue;

    const texto =
      columnas.length === 1
        ? partes[0].valor
        : partes.map((p) => `${p.columna} → ${p.valor}`).join('\n');

    opiniones.push(texto.slice(0, MAX_LARGO_OPINION));
  }

  return opiniones;
}