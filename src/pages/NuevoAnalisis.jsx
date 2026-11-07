import { useState } from 'react';
import { Plus, CalendarDays, Building2, Trash2, Play } from 'lucide-react';

const MAX_CARACTERES = 1000;

const estadoInicial = {
  nombre: '',
  tipo: 'Congreso',
  fecha: '',
  institucion: '',
  opiniones: '',
};

function NuevoAnalisis() {
  const [form, setForm] = useState(estadoInicial);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimpiar = () => setForm(estadoInicial);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Etapa 2: acá se enviarán las opiniones a Gemini
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

      <form className="form-card" onSubmit={handleSubmit}>
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

        <div className="field">
          <label htmlFor="opiniones">
            Opiniones de los asistentes <span className="required">*</span>
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
            {form.opiniones.length} / {MAX_CARACTERES}
          </span>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={handleLimpiar}>
            <Trash2 size={16} />
            Limpiar
          </button>
          <button type="submit" className="btn-primary">
            <Play size={16} />
            Analizar opiniones
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoAnalisis;