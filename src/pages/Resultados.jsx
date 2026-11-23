import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Plus,
  SearchX,
} from 'lucide-react';
import ChartCard from '../components/ChartCard';
import SentimientosDonut from '../components/SentimientosDonut';
import { useAnalisis } from '../hooks/useAnalisis';
import { datosSentimientos, formatearFecha, formatearTema } from '../utils/resultados';

function Mensaje({ titulo, texto, mostrarHistorial }) {
  return (
    <div className="page">
      <section className="estado-vacio">
        <SearchX size={32} />
        <h1>{titulo}</h1>
        <p>{texto}</p>
        <div className="estado-vacio-acciones">
          <Link to="/nuevo-analisis" className="btn-primary">
            <Plus size={16} />
            Nuevo análisis
          </Link>
          {mostrarHistorial && (
            <Link to="/historial" className="btn-outline">
              Ir al historial
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function Cargando() {
  return (
    <div className="page">
      <p className="lista-vacia">Cargando...</p>
    </div>
  );
}

function Resultados() {
  const { id } = useParams();
  const { analisis, cargando: cargandoLista, error: errorLista, obtenerAnalisis } = useAnalisis();
  const idObjetivo = id ?? analisis[0]?.id ?? null;
  const [carga, setCarga] = useState({ id: null, analisis: null, error: '' });

  useEffect(() => {
    if (!idObjetivo) return undefined;
    let cancelado = false;

    obtenerAnalisis(idObjetivo)
      .then((encontrado) => {
        if (!cancelado) setCarga({ id: idObjetivo, analisis: encontrado, error: '' });
      })
      .catch((err) => {
        if (!cancelado) setCarga({ id: idObjetivo, analisis: null, error: err.message });
      });

    return () => {
      cancelado = true;
    };
  }, [idObjetivo, obtenerAnalisis]);

  if (!id && cargandoLista) return <Cargando />;

  if (!id && errorLista) {
    return <Mensaje titulo="No se pudieron cargar tus análisis" texto={errorLista} />;
  }

  if (idObjetivo && carga.id !== idObjetivo) return <Cargando />;

  if (!idObjetivo) {
    return (
      <Mensaje
        titulo="Todavía no hay análisis"
        texto="Cargá las opiniones de un evento para ver acá sus resultados."
      />
    );
  }

  if (carga.error) {
    return (
      <Mensaje titulo="No se pudo cargar el análisis" texto={carga.error} mostrarHistorial />
    );
  }

  const actual = carga.analisis;

  if (!actual) {
    return (
      <Mensaje
        titulo="No encontramos ese análisis"
        texto="Puede que haya sido eliminado o que no pertenezca a tu cuenta."
        mostrarHistorial
      />
    );
  }

  const {
    evento,
    resumen,
    temasFrecuentes,
    aspectosPositivos,
    problemasDetectados,
    recomendaciones,
  } = actual;

  const maxTema = Math.max(...temasFrecuentes.map((t) => t.porcentaje), 1);

  return (
    <div className="page">
      <div className="results-top">
        <Link to="/historial" className="btn-back">
          <ArrowLeft size={14} />
          Volver
        </Link>
        <button
          type="button"
          className="btn-primary"
          disabled
          title="Se activa cuando se integre Make"
        >
          <Mail size={16} />
          Enviar informe
        </button>
      </div>

      <section className="event-card">
        <div className="event-thumb">
          <Presentation size={30} />
        </div>
        <div className="event-info">
          <h1>{evento.nombre}</h1>
          <p className="event-meta">
            <CalendarDays size={14} />
            {formatearFecha(evento.fecha)} · {evento.tipo}
            {evento.institucion ? ` · ${evento.institucion}` : ''}
          </p>
          <p className="event-status">
            <CircleCheck size={14} />
            Análisis completado con éxito
          </p>
        </div>
        <div className="event-total">
          <strong>{resumen.totalOpiniones.toLocaleString('es-AR')}</strong>
          <span>Opiniones analizadas</span>
        </div>
      </section>

      <div className="results-grid">
        <ChartCard title="Sentimientos" icon={ChartColumn}>
          <SentimientosDonut data={datosSentimientos(resumen.sentimientos)} />
        </ChartCard>

        <ChartCard title="Temas frecuentes" icon={Tag}>
          {temasFrecuentes.length === 0 ? (
            <p className="lista-vacia">No se identificaron temas.</p>
          ) : (
            <ul className="tema-list">
              {temasFrecuentes.map((t) => (
                <li key={t.nombre} className="tema-item">
                  <div
                    className="tema-chip"
                    style={{ '--w': `${(t.porcentaje / maxTema) * 100}%` }}
                  >
                    <span>{formatearTema(t.nombre)}</span>
                    <strong>{Math.round(t.porcentaje)}%</strong>
                  </div>
                  {t.descripcion && <p className="tema-desc">{t.descripcion}</p>}
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Aspectos destacados" icon={Star}>
          {aspectosPositivos.length === 0 ? (
            <p className="lista-vacia">No se detectaron aspectos destacados.</p>
          ) : (
            <ul className="check-list">
              {aspectosPositivos.map((texto, i) => (
                <li key={`${i}-${texto}`}>
                  <CircleCheck size={18} />
                  {texto}
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="results-bottom">
        <ChartCard title="Problemas detectados" icon={TriangleAlert} className="card-problems">
          {problemasDetectados.length === 0 ? (
            <p className="lista-vacia">No se detectaron problemas.</p>
          ) : (
            <ul className="problem-list">
              {problemasDetectados.map((texto, i) => (
                <li key={`${i}-${texto}`}>{texto}</li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Recomendaciones de Gemini" icon={Lightbulb} className="card-reco">
          {recomendaciones.length === 0 ? (
            <p className="lista-vacia">No hay recomendaciones para este análisis.</p>
          ) : (
            <ul className="reco-list">
              {recomendaciones.map((texto, i) => (
                <li key={`${i}-${texto}`}>{texto}</li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export default Resultados;