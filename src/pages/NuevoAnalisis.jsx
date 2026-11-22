import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  CalendarDays,
  Building2,
  Trash2,
  Play,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react';
import { analizarOpiniones } from '../services/api';
import { useAnalisis } from '../hooks/useAnalisis';
import ImportarArchivo from '../components/ImportarArchivo';

const MAX_CARACTERES = 20000;

const estadoInicial = {
  nombre: '',
  tipo: 'Congreso',
  fecha: '',
  institucion: '',
  opiniones: '',
};

function separarOpiniones(texto) {
  return texto
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);
}

function NuevoAnalisis() {
  const navigate = useNavigate();
  const { agregarAnalisis } = useAnalisis();
  const [form, setForm] = useState(estadoInicial);
  const [estado, setEstado] = useState('inactivo');
  const [error, setError] = useState('');
  const [modo, setModo] = useState('escribir');
  const [opinionesArchivo, setOpinionesArchivo] = useState([]);
  const [claveArchivo, setClaveArchivo] = useState(0);

  const cargando = estado === 'cargando';
  const cantidadOpiniones = separarOpiniones(form.opiniones).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimpiar = () => {
    setForm(estadoInicial);
    setEstado('inactivo');
    setError('');
    setOpinionesArchivo([]);
    setClaveArchivo((n) => n + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;

    setEstado('cargando');
    setError('');

    try {
      const datos = await analizarOpiniones({
        nombre: form.nombre,
        tipo: form.tipo,
        fecha: form.fecha,
        institucion: form.institucion,
        opiniones: modo === 'archivo' ? opinionesArchivo : separarOpiniones(form.opiniones),
      });

      const guardado = await agregarAnalisis(datos);
      navigate(`/resultados/${guardado.id}`);
    } catch (err) {
      setError(err.message);
      setEstado('error');
    }
  };

  return (
    <div className="page">
      <section className="page-header">
        <span className="page-header-icon">
          <Plus size={26} />
        </span>
        <div>
          <h1>Nuevo análisis</h1>
          <p>
            Ingresá la información de tu congreso o conferencia y cargá las
            opiniones de los asistentes.
          </p>
        </div>
      </section>

      <form className="form-card" onSubmit={handleSubmit} aria-busy={cargando}>
        <fieldset className="form-fieldset" disabled={cargando}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nombre">
                Nombre del evento <span className="required">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Congreso de Tecnología 2025"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="tipo">
                Tipo de evento <span className="required">*</span>
              </label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                <option>Congreso</option>
                <option>Conferencia</option>
                <option>Jornada</option>
                <option>Seminario</option>
                <option>Otro</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="fecha">
                Fecha del evento <span className="required">*</span>
              </label>
              <div className="input-icon">
                <CalendarDays size={18} />
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="institucion">
                Institución <span className="optional">(opcional)</span>
              </label>
              <div className="input-icon">
                <Building2 size={18} />
                <input
                  id="institucion"
                  name="institucion"
                  type="text"
                  placeholder="Tech Events"
                  value={form.institucion}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div
            className="modo-opiniones"
            role="group"
            aria-label="Forma de cargar las opiniones"
          >
            <button
              type="button"
              className={modo === 'escribir' ? 'modo-btn activo' : 'modo-btn'}
              aria-pressed={modo === 'escribir'}
              onClick={() => setModo('escribir')}
            >
              Escribir opiniones
            </button>
            <button
              type="button"
              className={modo === 'archivo' ? 'modo-btn activo' : 'modo-btn'}
              aria-pressed={modo === 'archivo'}
              onClick={() => setModo('archivo')}
            >
              Cargar archivo o enlace
            </button>
          </div>

          {modo === 'escribir' ? (
            <div className="field">
              <label htmlFor="opiniones">
                Opiniones de los asistentes <span className="required">*</span>{' '}
                <span className="optional">(una por línea)</span>
              </label>
              <textarea
                id="opiniones"
                name="opiniones"
                rows={7}
                maxLength={MAX_CARACTERES}
                placeholder="Pegá o escribí las opiniones aquí..."
                value={form.opiniones}
                onChange={handleChange}
                required
              />
              <span className="char-count">
                {cantidadOpiniones} {cantidadOpiniones === 1 ? 'opinión' : 'opiniones'} ·{' '}
                {form.opiniones.length} / {MAX_CARACTERES}
              </span>
            </div>
          ) : (
            <div className="field">
              <span className="field-titulo">
                Opiniones de los asistentes <span className="required">*</span>
              </span>
              <ImportarArchivo key={claveArchivo} onOpiniones={setOpinionesArchivo} />
            </div>
          )}

          {estado === 'error' && (
            <div className="aviso aviso-error" role="alert">
              <TriangleAlert size={18} />
              <div>
                <strong>No se pudo completar el análisis</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={handleLimpiar}>
              <Trash2 size={16} />
              Limpiar
            </button>
            <button type="submit" className="btn-primary">
              {cargando ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Play size={16} />
              )}
              {cargando ? 'Analizando...' : 'Analizar opiniones'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default NuevoAnalisis;