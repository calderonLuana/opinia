import { Search, Bell, Moon, Sun } from 'lucide-react';

function Header() {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} />
        <input type="text" placeholder="Buscar..." />
      </div>

      <div className="header-actions">
        <div className="theme-pill">
          <span className="theme-knob">
            <Moon size={12} />
          </span>
          <Sun size={12} />
        </div>
        <button className="icon-btn" aria-label="Notificaciones">
          <Bell size={20} />
          <span className="notif-dot" />
        </button>
        <div className="avatar">JD</div>
      </div>
    </header>
  );
}

export default Header;