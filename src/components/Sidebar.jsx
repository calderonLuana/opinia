import { NavLink } from 'react-router-dom';
import { House, Plus, ChartColumn, History, Sparkles } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: House, end: true },
  { to: '/nuevo-analisis', label: 'Nuevo análisis', icon: Plus },
  { to: '/resultados', label: 'Resultados', icon: ChartColumn },
  { to: '/historial', label: 'Historial', icon: History },
];

function Sidebar() {
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
    </aside>
  );
}

export default Sidebar;