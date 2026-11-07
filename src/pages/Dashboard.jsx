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
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import SentimientosDonut from '../components/SentimientosDonut';
import { resumen, sentimientos, ultimosAnalisis } from '../data/mockData';

function Dashboard() {
  return (
    <div className="page">
      <section className="hero">
        <h1>¡Hola, Juan!</h1>
        <p>
          Descubrí qué opinan los asistentes de tus congresos y mejorá la
          experiencia en tus próximos eventos.
        </p>
        <Link to="/nuevo-analisis" className="btn-primary">
          <Plus size={18} />
          Nuevo análisis
        </Link>
      </section>

      <div className="stat-grid">
        <StatCard
          icon={CalendarCheck}
          value={resumen.analisis}
          label="Análisis realizados"
          trend={20}
          color="var(--lila)"
        />
        <StatCard
          icon={MessageCircle}
          value={resumen.opiniones.toLocaleString('es-AR')}
          label="Opiniones procesadas"
          trend={35}
          color="var(--neutro)"
        />
        <StatCard
          icon={Smile}
          value={`${resumen.positivo}%`}
          label="Sentimiento positivo"
          trend={8}
          color="var(--positivo)"
        />
        <StatCard
          icon={Frown}
          value={`${resumen.negativo}%`}
          label="Sentimiento negativo"
          trend={-5}
          color="var(--negativo)"
        />
      </div>

      <div className="dashboard-grid">
        <ChartCard title="Distribución de sentimientos" icon={ChartColumn}>
          <SentimientosDonut data={sentimientos} />
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
          <ul className="analisis-list">
            {ultimosAnalisis.map((a) => (
              <li key={a.id} className="analisis-item">
                <span className="analisis-icon">
                  <Presentation size={18} />
                </span>
                <div className="analisis-info">
                  <strong>{a.nombre}</strong>
                  <span>{a.fecha}</span>
                </div>
                <span className="analisis-count">
                  {a.opiniones.toLocaleString('es-AR')} opiniones
                </span>
                <Link to="/resultados" className="btn-small">
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
}

export default Dashboard;