
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App.jsx';
import { AnalisisProvider } from './context/AnalisisProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnalisisProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AnalisisProvider>
  </StrictMode>,
);
