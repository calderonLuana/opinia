import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoaderCircle, TriangleAlert, CircleCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TEXTOS = {
  ingresar: {
    titulo: 'Iniciá sesión',
    subtitulo: 'Ingresá a tu cuenta para ver tus análisis.',
    boton: 'Iniciar sesión',
  },
  registro: {
    titulo: 'Creá tu cuenta',
    subtitulo: 'Registrate con tu correo electrónico y una contraseña.',
    boton: 'Crear cuenta',
  },
  olvide: {
    titulo: 'Recuperá tu contraseña',
    subtitulo: 'Te enviamos un enlace por correo para crear una nueva.',
    boton: 'Enviar enlace',
  },
};

function Acceso() {
  const { sesion, registrarse, iniciarSesion, recuperarContrasena } = useAuth();
  const [vista, setVista] = useState('ingresar');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  if (sesion) {
    return <Navigate to="/" replace />;
  }

  const textos = TEXTOS[vista];

  const cambiarVista = (nueva) => {
    setVista(nueva);
    setError('');
    setAviso('');
    setContrasena('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;

    const correoLimpio = correo.trim();
    setCargando(true);
    setError('');
    setAviso('');

    try {
      if (vista === 'ingresar') {
        await iniciarSesion(correoLimpio, contrasena);
      } else if (vista === 'registro') {
        const { requiereConfirmacion } = await registrarse(correoLimpio, contrasena);
        if (requiereConfirmacion) {
          setVista('ingresar');
          setContrasena('');
          setAviso(
            `Te enviamos un correo a ${correoLimpio} para confirmar tu cuenta. Revisá también la carpeta de spam.`,
          );
        }
      } else {
        await recuperarContrasena(correoLimpio);
        setAviso(
          'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="acceso">
      <div className="acceso-card">
        <div className="acceso-marca">
          <div className="sidebar-logo">OpinIA</div>
          <div className="sidebar-tagline">Analizá • Comprendé • Mejorá</div>
        </div>

        <h1>{textos.titulo}</h1>
        <p className="acceso-subtitulo">{textos.subtitulo}</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          {vista !== 'olvide' && (
            <div className="field">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                autoComplete={vista === 'registro' ? 'new-password' : 'current-password'}
                minLength={vista === 'registro' ? 8 : undefined}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              {vista === 'registro' && (
                <span className="acceso-ayuda">Mínimo 8 caracteres.</span>
              )}
            </div>
          )}

          {error && (
            <div className="aviso aviso-error" role="alert">
              <TriangleAlert size={18} />
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {aviso && (
            <div className="aviso aviso-exito" role="status">
              <CircleCheck size={18} />
              <div>
                <span>{aviso}</span>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary acceso-boton" disabled={cargando}>
            {cargando ? <LoaderCircle size={16} className="spin" /> : null}
            {cargando ? 'Un momento...' : textos.boton}
          </button>
        </form>

        <div className="acceso-enlaces">
          {vista === 'ingresar' && (
            <>
              <button
                type="button"
                className="acceso-enlace"
                onClick={() => cambiarVista('olvide')}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button
                type="button"
                className="acceso-enlace"
                onClick={() => cambiarVista('registro')}
              >
                ¿No tenés cuenta? Registrate
              </button>
            </>
          )}
          {vista === 'registro' && (
            <button
              type="button"
              className="acceso-enlace"
              onClick={() => cambiarVista('ingresar')}
            >
              ¿Ya tenés cuenta? Iniciá sesión
            </button>
          )}
          {vista === 'olvide' && (
            <button
              type="button"
              className="acceso-enlace"
              onClick={() => cambiarVista('ingresar')}
            >
              Volver a iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Acceso;