import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function RestablecerContrasena() {
  const navigate = useNavigate();
  const { sesion, cargando: verificando, actualizarContrasena } = useAuth();
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;

    if (nueva !== repetida) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await actualizarContrasena(nueva);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (verificando) {
    return (
      <div className="acceso">
        <div className="acceso-cargando">
          <LoaderCircle size={28} className="spin" />
          <span>Verificando el enlace...</span>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return (
      <div className="acceso">
        <div className="acceso-card">
          <h1>El enlace no es válido</h1>
          <p className="acceso-subtitulo">
            El enlace venció o ya fue utilizado. Pedí uno nuevo desde la pantalla de acceso.
          </p>
          <Link to="/acceso" className="btn-primary acceso-boton">
            Ir a la pantalla de acceso
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="acceso">
      <div className="acceso-card">
        <h1>Nueva contraseña</h1>
        <p className="acceso-subtitulo">Elegí la contraseña que vas a usar de ahora en más.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nueva">Nueva contraseña</label>
            <input
              id="nueva"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
            />
            <span className="acceso-ayuda">Mínimo 8 caracteres.</span>
          </div>

          <div className="field">
            <label htmlFor="repetida">Repetir contraseña</label>
            <input
              id="repetida"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="aviso aviso-error" role="alert">
              <TriangleAlert size={18} />
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary acceso-boton" disabled={cargando}>
            {cargando ? <LoaderCircle size={16} className="spin" /> : null}
            {cargando ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RestablecerContrasena;