import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import './styles/acceso.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import { AnalisisProvider } from './context/AnalisisProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AnalisisProvider>
          <App />
        </AnalisisProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);