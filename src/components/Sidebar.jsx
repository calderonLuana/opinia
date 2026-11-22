import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { House, Plus, ChartColumn, History, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', label: 'Dashboard', icon: House, end: true },
  { to: '/nuevo-analisis', label: 'Nuevo análisis', icon: Plus },
  { to: '/resultados', label: 'Resultados', icon: ChartColumn },
  { to: '/historial', label: 'Historial', icon: History },
];

function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();
  const [saliendo, setSaliendo] = useState(false);

  const correo = usuario?.email ?? '';
  const inicial = correo.charAt(0).toUpperCase() || '?';

  const handleCerrarSesion = async () => {
    setSaliendo(true);
    try {
      await cerrarSesion();
    } catch (error) {
      console.error(error);
      setSaliendo(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <ChartColumn size={34} />
          <Sparkles size={14} className="sidebar-logo-spark" />
        </div>
        <div className="sidebar-logo">OpinIA</div>
        <div className="sidebar-tagline">Analizá • Comprendé • Mejorá</div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-cuenta">
        <div className="cuenta-datos">
          <div className="avatar">{inicial}</div>
          <div className="cuenta-email" title={correo}>
            {correo}
          </div>
        </div>
        <button
          type="button"
          className="btn-outline cuenta-salir"
          onClick={handleCerrarSesion}
          disabled={saliendo}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;