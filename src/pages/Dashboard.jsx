import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  MessageCircle,
  Smile,
  Frown,
  ChartColumn,
  History,
  Plus,
  ArrowRight,
  Presentation,
  TriangleAlert,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import SentimientosDonut from '../components/SentimientosDonut';
import { useAnalisis } from '../hooks/useAnalisis';
import { calcularEstadisticas, formatearFecha } from '../utils/resultados';

function Dashboard() {
  const { analisis, cargando, error } = useAnalisis();
  const estadisticas = calcularEstadisticas(analisis);
  const ultimos = analisis.slice(0, 3);
  const mostrar = (valor) => (cargando ? '—' : valor);

  return (
    <div className="page">
      <section className="hero">
        <h1>¡Bienvenido a OpinIA!</h1>
        <p>
          Descubrí qué opinan los asistentes de tus congresos y mejorá la
          experiencia en tus próximos eventos.
        </p>
        <Link to="/nuevo-analisis" className="btn-primary">
          <Plus size={18} />
          Nuevo análisis
        </Link>
      </section>

      {error && (
        <div className="aviso aviso-error" role="alert">
          <TriangleAlert size={18} />
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <StatCard
          icon={CalendarCheck}
          value={mostrar(estadisticas.totalAnalisis)}
          label="Análisis realizados"
          color="var(--lila)"
        />
        <StatCard
          icon={MessageCircle}
          value={mostrar(estadisticas.totalOpiniones.toLocaleString('es-AR'))}
          label="Opiniones procesadas"
          color="var(--neutro)"
        />
        <StatCard
          icon={Smile}
          value={mostrar(`${estadisticas.positivo}%`)}
          label="Sentimiento positivo"
          color="var(--positivo)"
        />
        <StatCard
          icon={Frown}
          value={mostrar(`${estadisticas.negativo}%`)}
          label="Sentimiento negativo"
          color="var(--negativo)"
        />
      </div>

      <div className="dashboard-grid">
        <ChartCard title="Distribución de sentimientos" icon={ChartColumn}>
          {estadisticas.totalOpiniones > 0 ? (
            <SentimientosDonut data={estadisticas.sentimientos} />
          ) : (
            <p className="lista-vacia">
              Cuando realices tu primer análisis, acá vas a ver la distribución de
              sentimientos.
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Últimos análisis"
          icon={History}
          action={
            <Link to="/historial" className="link-ver-todos">
              Ver todos <ArrowRight size={14} />
            </Link>
          }
        >
          {ultimos.length === 0 ? (
            <p className="lista-vacia">
              Todavía no realizaste ningún análisis. Creá el primero con el botón
              Nuevo análisis.
            </p>
          ) : (
            <ul className="analisis-list">
              {ultimos.map((a) => (
                <li key={a.id} className="analisis-item">
                  <span className="analisis-icon">
                    <Presentation size={18} />
                  </span>
                  <div className="analisis-info">
                    <strong>{a.evento.nombre}</strong>
                    <span>{formatearFecha(a.evento.fecha)}</span>
                  </div>
                  <span className="analisis-count">
                    {a.resumen.totalOpiniones.toLocaleString('es-AR')} opiniones
                  </span>
                  <Link to={`/resultados/${a.id}`} className="btn-small">
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export default Dashboard;