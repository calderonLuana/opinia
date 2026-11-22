import { useContext } from 'react';
import { AnalisisContext } from '../context/analisisContext';

export function useAnalisis() {
  const contexto = useContext(AnalisisContext);

  if (!contexto) {
    throw new Error('useAnalisis debe utilizarse dentro de AnalisisProvider');
  }

  return contexto;
}