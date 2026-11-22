import { useEffect, useState } from 'react';
import { AnalisisContext } from './analisisContext';

const CLAVE_STORAGE = 'opinia.analisis';

function cargarAnalisis() {
  try {
    const guardados = localStorage.getItem(CLAVE_STORAGE);
    const lista = guardados ? JSON.parse(guardados) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function generarId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function AnalisisProvider({ children }) {
  const [analisis, setAnalisis] = useState(cargarAnalisis);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(analisis));
    } catch {
      console.warn('No se pudo guardar el historial en LocalStorage.');
    }
  }, [analisis]);

  const agregarAnalisis = (datos) => {
    const nuevo = {
      ...datos,
      id: generarId(),
      creadoEn: new Date().toISOString(),
    };

    setAnalisis((actuales) => [nuevo, ...actuales]);
    return nuevo;
  };

  const obtenerAnalisis = (id) => {
    return analisis.find((item) => item.id === id);
  };

  const eliminarAnalisis = (id) => {
    setAnalisis((actuales) => actuales.filter((item) => item.id !== id));
  };

  return (
    <AnalisisContext.Provider
      value={{
        analisis,
        agregarAnalisis,
        obtenerAnalisis,
        eliminarAnalisis,
      }}
    >
      {children}
    </AnalisisContext.Provider>
  );
}