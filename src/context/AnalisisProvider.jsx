import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AnalisisContext } from './analisisContext';
import {
  listarAnalisis,
  obtenerAnalisisPorId,
  guardarAnalisis,
  eliminarAnalisisPorId,
} from '../services/analisisService';

export function AnalisisProvider({ children }) {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;
  const [estado, setEstado] = useState({ usuarioId: null, lista: [], error: '' });

  useEffect(() => {
    if (!usuarioId) return undefined;
    let cancelado = false;

    listarAnalisis()
      .then((lista) => {
        if (!cancelado) setEstado({ usuarioId, lista, error: '' });
      })
      .catch((err) => {
        if (!cancelado) setEstado({ usuarioId, lista: [], error: err.message });
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioId]);

  const vigente = usuarioId !== null && estado.usuarioId === usuarioId;
  const analisis = vigente ? estado.lista : [];
  const cargando = usuarioId !== null && !vigente;
  const error = vigente ? estado.error : '';

  const agregarAnalisis = async (resultado) => {
    const guardado = await guardarAnalisis(resultado);
    setEstado((previo) =>
      previo.usuarioId === usuarioId
        ? { ...previo, lista: [guardado, ...previo.lista] }
        : previo,
    );
    return guardado;
  };

  const eliminarAnalisis = async (id) => {
    await eliminarAnalisisPorId(id);
    setEstado((previo) => ({
      ...previo,
      lista: previo.lista.filter((item) => item.id !== id),
    }));
  };

  return (
    <AnalisisContext.Provider
      value={{
        analisis,
        cargando,
        error,
        agregarAnalisis,
        eliminarAnalisis,
        obtenerAnalisis: obtenerAnalisisPorId,
      }}
    >
      {children}
    </AnalisisContext.Provider>
  );
}