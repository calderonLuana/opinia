import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NuevoAnalisis from './pages/NuevoAnalisis';
import Resultados from './pages/Resultados';
import Historial from './pages/Historial';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="app-main">
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nuevo-analisis" element={<NuevoAnalisis />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;