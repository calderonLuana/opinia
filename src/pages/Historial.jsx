import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarClock, Presentation, ArrowRight } from 'lucide-react';
import { historial } from '../data/mockData';

function claseSentimiento(positivo) {
  if (positivo >= 70) return 'badge-verde';
  if (positivo >= 65) return 'badge-azul';
  return 'badge-naranja';
}

function Historial() {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = historial.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

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

      {filtrados.length === 0 ? (
        <p className="history-empty">
          No se encontraron análisis con ese nombre.
        </p>
      ) : (
        <ul className="history-list">
          {filtrados.map((a) => (
            <li key={a.id} className="history-item">
              <span className="history-thumb">
                <Presentation size={22} />
              </span>
              <div className="history-info">
                <strong>{a.nombre}</strong>
                <span>
                  {a.tipo} · {a.fecha}
                </span>
              </div>
              <span className="history-count">
                {a.opiniones.toLocaleString('es-AR')} opiniones
              </span>
              <span className={`badge ${claseSentimiento(a.positivo)}`}>
                {a.positivo}% positivas
              </span>
              <Link to="/resultados" className="btn-outline btn-ver">
                Ver resultados <ArrowRight size={14} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Historial;