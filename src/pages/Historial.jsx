import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarClock,
  Presentation,
  ArrowRight,
  Trash2,
  Plus,
  Inbox,
  TriangleAlert,
} from 'lucide-react';
import { useAnalisis } from '../hooks/useAnalisis';
import { formatearFecha, normalizarTexto } from '../utils/resultados';

function claseSentimiento(positivo) {
  if (positivo >= 70) return 'badge-verde';
  if (positivo >= 65) return 'badge-azul';
  return 'badge-naranja';
}

function Historial() {
  const { analisis, cargando, error, eliminarAnalisis } = useAnalisis();
  const [busqueda, setBusqueda] = useState('');
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  const termino = normalizarTexto(busqueda.trim());
  const filtrados = analisis.filter((a) =>
    normalizarTexto(a.evento.nombre).includes(termino),
  );

  const handleEliminar = async (id) => {
    setEliminando(true);
    setErrorEliminar('');

    try {
      await eliminarAnalisis(id);
      setConfirmandoId(null);
    } catch (err) {
      setErrorEliminar(err.message);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="page">
      <section className="page-header">
        <span className="page-header-icon">
          <CalendarClock size={26} />
        </span>
        <div>
          <h1>Historial de análisis</h1>
          <p>Consultá los congresos y conferencias analizados anteriormente.</p>
        </div>
      </section>

      {cargando && <p className="lista-vacia">Cargando tus análisis...</p>}

      {!cargando && error && (
        <div className="aviso aviso-error" role="alert">
          <TriangleAlert size={18} />
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!cargando && !error && analisis.length === 0 && (
        <section className="estado-vacio">
          <Inbox size={32} />
          <h1>Todavía no hay análisis guardados</h1>
          <p>
            Cada análisis que realices se guardará acá para que puedas consultarlo
            cuando quieras.
          </p>
          <div className="estado-vacio-acciones">
            <Link to="/nuevo-analisis" className="btn-primary">
              <Plus size={16} />
              Nuevo análisis
            </Link>
          </div>
        </section>
      )}

      {!cargando && analisis.length > 0 && (
        <>
          <div className="history-toolbar">
            <div className="history-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre del evento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <span className="history-sort">Ordenar por: Más recientes</span>
          </div>

          {errorEliminar && (
            <div className="aviso aviso-error" role="alert">
              <TriangleAlert size={18} />
              <div>
                <span>{errorEliminar}</span>
              </div>
            </div>
          )}

          {filtrados.length === 0 ? (
            <p className="history-empty">No se encontraron análisis con ese nombre.</p>
          ) : (
            <ul className="history-list">
              {filtrados.map((a) => {
                const positivo = Math.round(a.resumen.sentimientos.positivo.porcentaje);
                const confirmando = confirmandoId === a.id;

                return (
                  <li key={a.id} className="history-item">
                    <span className="history-thumb">
                      <Presentation size={22} />
                    </span>

                    <div className="history-info">
                      <strong>{a.evento.nombre}</strong>
                      <span>
                        {a.evento.tipo} · {formatearFecha(a.evento.fecha)}
                      </span>
                    </div>

                    <span className="history-count">
                      {a.resumen.totalOpiniones.toLocaleString('es-AR')} opiniones
                    </span>

                    <span className={`badge ${claseSentimiento(positivo)}`}>
                      {positivo}% positivas
                    </span>

                    <div className="history-actions">
                      {confirmando ? (
                        <>
                          <span className="confirmar-texto">¿Eliminar?</span>
                          <button
                            type="button"
                            className="btn-peligro"
                            onClick={() => handleEliminar(a.id)}
                            disabled={eliminando}
                          >
                            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                          </button>
                          <button
                            type="button"
                            className="btn-outline btn-ver"
                            onClick={() => setConfirmandoId(null)}
                            disabled={eliminando}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to={`/resultados/${a.id}`} className="btn-outline btn-ver">
                            Ver resultados <ArrowRight size={14} />
                          </Link>
                          <button
                            type="button"
                            className="btn-icono"
                            aria-label={`Eliminar el análisis ${a.evento.nombre}`}
                            onClick={() => {
                              setErrorEliminar('');
                              setConfirmandoId(a.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Historial;