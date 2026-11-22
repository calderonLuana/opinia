import { Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './components/RutaProtegida';
import Acceso from './pages/Acceso';
import RestablecerContrasena from './pages/RestablecerContrasena';
import Dashboard from './pages/Dashboard';
import NuevoAnalisis from './pages/NuevoAnalisis';
import Resultados from './pages/Resultados';
import Historial from './pages/Historial';

function App() {
  return (
    <Routes>
      <Route path="/acceso" element={<Acceso />} />
      <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

      <Route element={<RutaProtegida />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nuevo-analisis" element={<NuevoAnalisis />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/resultados/:id" element={<Resultados />} />
        <Route path="/historial" element={<Historial />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;