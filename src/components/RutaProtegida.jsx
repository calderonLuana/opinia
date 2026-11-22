import { Navigate, Outlet } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';

function RutaProtegida() {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="acceso">
        <div className="acceso-cargando">
          <LoaderCircle size={28} className="spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return <Navigate to="/acceso" replace />;
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default RutaProtegida;