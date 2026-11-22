import { useEffect, useMemo, useRef, useState } from 'react';
import { FileUp, X, TriangleAlert, LoaderCircle } from 'lucide-react';
import {
  leerArchivo,
  leerPlanilla,
  obtenerExtension,
  EXTENSIONES_PERMITIDAS,
  detectarColumnasDeTexto,
  construirOpiniones,
  MAX_RESPUESTAS,
} from '../utils/leerArchivo';
import { importarDesdeSheets } from '../services/api';

const MAX_BYTES = 2 * 1024 * 1024;

function ejemplo(filas, columna) {
  const fila = filas.find((f) => String(f[columna] ?? '').trim());
  const valor = fila ? String(fila[columna]).trim() : '';
  return valor.length > 80 ? `${valor.slice(0, 80)}…` : valor;
}

function ImportarArchivo({ onOpiniones }) {
  const inputRef = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [error, setError] = useState('');
  const [enlace, setEnlace] = useState('');
  const [cargandoEnlace, setCargandoEnlace] = useState(false);

  const opiniones = useMemo(() => {
    if (!archivo) return [];
    const elegidas = archivo.columnas.filter((c) => seleccionadas.includes(c));
    return construirOpiniones(archivo.filas, elegidas);
  }, [archivo, seleccionadas]);

  useEffect(() => {
    onOpiniones(opiniones);
  }, [opiniones, onOpiniones]);

  const reiniciar = () => {
    setArchivo(null);
    setSeleccionadas([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const aplicarPlanilla = (nombre, { columnas, filas }) => {
    setArchivo({ nombre, columnas, filas });
    setSeleccionadas(detectarColumnasDeTexto(columnas, filas));
  };

  const handleArchivo = async (e) => {
    const elegido = e.target.files?.[0];
    if (!elegido) return;

    setError('');
    const extension = obtenerExtension(elegido);

    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      reiniciar();
      setError(
        'El archivo debe ser CSV o Excel (.xlsx o .xls). Desde Google Forms o Google Sheets, descargá las respuestas como CSV o como Microsoft Excel (.xlsx).',
      );
      return;
    }

    if (elegido.size > MAX_BYTES) {
      reiniciar();
      setError('El archivo supera los 2 MB. Dividilo en partes más chicas.');
      return;
    }

    try {
      aplicarPlanilla(elegido.name, await leerArchivo(elegido));
    } catch (err) {
      reiniciar();
      setError(err.message);
    }
  };

  const handleImportarEnlace = async () => {
    const valor = enlace.trim();

    if (!valor) {
      setError('Pegá el enlace de la planilla de Google Sheets.');
      return;
    }

    setError('');
    setCargandoEnlace(true);

    try {
      const csv = await importarDesdeSheets(valor);
      aplicarPlanilla('Planilla de Google Sheets', leerPlanilla(csv));
      setEnlace('');
    } catch (err) {
      reiniciar();
      setError(err.message);
    } finally {
      setCargandoEnlace(false);
    }
  };

  const handleTeclaEnlace = (e) => {
    if (e.key === 'Enter') {
      // Evita que Enter envíe el formulario de Nuevo análisis
      e.preventDefault();
      handleImportarEnlace();
    }
  };

  const alternarColumna = (columna) => {
    setSeleccionadas((prev) =>
      prev.includes(columna) ? prev.filter((c) => c !== columna) : [...prev, columna],
    );
  };

  const excede = opiniones.length > MAX_RESPUESTAS;
  const mensajeError =
    error ||
    (excede
      ? `La planilla tiene ${opiniones.length} respuestas. En esta versión se pueden analizar hasta ${MAX_RESPUESTAS} por vez: dividila en partes.`
      : '');

  return (
    <div className="importar">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleArchivo}
        hidden
      />

      {!archivo ? (
        <div className="dropzone">
          <FileUp size={28} />
          <p>Cargá el archivo con las respuestas de la encuesta (CSV o Excel)</p>
          <button
            type="button"
            className="btn-outline"
            onClick={() => inputRef.current?.click()}
          >
            Seleccionar archivo
          </button>
          <a href="/plantilla-opiniones.csv" download className="link-plantilla">
            Descargar archivo de ejemplo
          </a>

          <p>o pegá el enlace de una planilla de Google Sheets</p>
          <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 560 }}>
            <input
              type="text"
              inputMode="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
              onKeyDown={handleTeclaEnlace}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-outline"
              onClick={handleImportarEnlace}
              disabled={cargandoEnlace}
            >
              {cargandoEnlace ? <LoaderCircle size={16} className="spin" /> : null}
              {cargandoEnlace ? 'Importando...' : 'Importar'}
            </button>
          </div>
          <span style={{ fontSize: '0.75rem' }}>
            La planilla debe estar compartida como «Cualquier persona con el enlace»
            (lector).
          </span>
        </div>
      ) : (
        <div className="archivo-cargado">
          <div className="archivo-cabecera">
            <strong>{archivo.nombre}</strong>
            <span>
              {archivo.filas.length} respuestas · {archivo.columnas.length} columnas
            </span>
            <button
              type="button"
              className="btn-quitar"
              onClick={reiniciar}
              aria-label="Quitar archivo"
            >
              <X size={16} />
            </button>
          </div>

          <p className="archivo-ayuda">
            Elegí las columnas que contienen comentarios. Las demás (nombre, correo,
            puntajes) no se envían al análisis.
          </p>

          <ul className="columnas">
            {archivo.columnas.map((columna) => (
              <li key={columna}>
                <label>
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(columna)}
                    onChange={() => alternarColumna(columna)}
                  />
                  <span className="columna-nombre">{columna}</span>
                  <span className="columna-ejemplo">{ejemplo(archivo.filas, columna)}</span>
                </label>
              </li>
            ))}
          </ul>

          {seleccionadas.length === 0 ? (
            <p className="archivo-resumen vacio">
              Seleccioná al menos una columna con comentarios.
            </p>
          ) : (
            <p className="archivo-resumen">
              {opiniones.length}{' '}
              {opiniones.length === 1 ? 'respuesta lista' : 'respuestas listas'} para
              analizar
            </p>
          )}
        </div>
      )}

      {mensajeError && (
        <div className="aviso aviso-error" role="alert">
          <TriangleAlert size={18} />
          <div>
            <span>{mensajeError}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportarArchivo;