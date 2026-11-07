import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  Mail,
  Presentation,
  TriangleAlert,
  Lightbulb,
  ChartColumn,
  Tag,
  Star,
} from 'lucide-react';
import ChartCard from '../components/ChartCard';
import SentimientosDonut from '../components/SentimientosDonut';
import { sentimientos, resultadoEvento as ev } from '../data/mockData';

function Resultados() {
  const maxTema = Math.max(...ev.temas.map((t) => t.value));

  return (
    <div className="page">
      <div className="results-top">
        <Link to="/historial" className="btn-back">
          <ArrowLeft size={14} />
          Volver
        </Link>
        <button type="button" className="btn-primary">
          <Mail size={16} />
          Enviar informe
        </button>
      </div>

      <section className="event-card">
        <div className="event-thumb">
          <Presentation size={30} />
        </div>
        <div className="event-info">
          <h1>{ev.nombre}</h1>
          <p className="event-meta">
            <CalendarDays size={14} />
            {ev.fecha} · {ev.tipo}
          </p>
          <p className="event-status">
            <CircleCheck size={14} />
            Análisis completado con éxito
          </p>
        </div>
        <div className="event-total">
          <strong>{ev.opiniones.toLocaleString('es-AR')}</strong>
          <span>Opiniones analizadas</span>
        </div>
      </section>

      <div className="results-grid">
        <ChartCard title="Sentimientos" icon={ChartColumn}>
          <SentimientosDonut data={sentimientos} />
        </ChartCard>

        <ChartCard title="Temas frecuentes" icon={Tag}>
          <ul className="tema-list">
            {ev.temas.map((t) => (
              <li
                key={t.name}
                className="tema-chip"
                style={{ '--w': `${(t.value / maxTema) * 100}%` }}
              >
                <span>{t.name}</span>
                <strong>{t.value}%</strong>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Aspectos destacados" icon={Star}>
          <ul className="check-list">
            {ev.destacados.map((d) => (
              <li key={d}>
                <CircleCheck size={18} />
                {d}
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      <div className="results-bottom">
        <ChartCard title="Problemas detectados" icon={TriangleAlert} className="card-problems">
          <ul className="problem-list">
            {ev.problemas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Recomendaciones de Gemini" icon={Lightbulb} className="card-reco">
          <p className="reco-text">{ev.recomendacion}</p>
        </ChartCard>
      </div>
    </div>
  );
}

export default Resultados;