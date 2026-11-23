import { supabase } from '../lib/supabase';

const COLUMNAS_LISTA = 'id, creado_en, evento, resumen';

function aItemDeLista(fila) {
  return {
    id: fila.id,
    creadoEn: fila.creado_en,
    evento: fila.evento,
    resumen: fila.resumen,
  };
}

function errorDeBase(mensaje, error) {
  console.error(mensaje, error);
  return new Error(`${mensaje} Intentá de nuevo en unos minutos.`);
}

export async function listarAnalisis() {
  const { data, error } = await supabase
    .from('analisis')
    .select(COLUMNAS_LISTA)
    .order('creado_en', { ascending: false });

  if (error) throw errorDeBase('No se pudieron cargar tus análisis.', error);
  return data.map(aItemDeLista);
}

export async function obtenerAnalisisPorId(id) {
  const { data, error } = await supabase
    .from('analisis')
    .select(`${COLUMNAS_LISTA}, detalle`)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    // Un identificador con formato inválido equivale a un análisis inexistente
    if (error.code === '22P02') return null;
    throw errorDeBase('No se pudo cargar el análisis.', error);
  }

  if (!data) return null;
  return { ...aItemDeLista(data), ...data.detalle };
}

export async function guardarAnalisis(resultado) {
  const { evento, resumen, ...detalle } = resultado;

  const { data, error } = await supabase
    .from('analisis')
    .insert({ evento, resumen, detalle })
    .select(COLUMNAS_LISTA)
    .single();

  if (error) throw errorDeBase('El análisis se realizó, pero no se pudo guardar.', error);
  return aItemDeLista(data);
}

export async function eliminarAnalisisPorId(id) {
  const { error } = await supabase.from('analisis').delete().eq('id', id);
  if (error) throw errorDeBase('No se pudo eliminar el análisis.', error);
}