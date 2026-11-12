import { generarJSON } from './geminiService.js';
import { INSTRUCCIONES, ESQUEMA_RESPUESTA, construirContenido } from './promptAnalisis.js';
import { parsearRespuesta, validarRespuesta } from '../utils/validarRespuestaGemini.js';
import { construirResultado } from '../utils/construirResultado.js';
import { ErrorAnalisis } from '../utils/errores.js';

const MAX_INTENTOS = 2;

function traducirErrorGemini(error) {
  switch (error?.status) {
    case 429:
      return new ErrorAnalisis(
        'Se alcanzó el límite de solicitudes de Gemini. Esperá un momento e intentá de nuevo.',
        429,
        'LIMITE_GEMINI',
      );
    case 400:
      return new ErrorAnalisis(
        'Gemini rechazó la solicitud. Revisá la configuración del servidor.',
        502,
        'SOLICITUD_GEMINI',
      );
    case 401:
    case 403:
      return new ErrorAnalisis(
        'No se pudo autenticar con Gemini. Revisá la API Key del servidor.',
        502,
        'CONFIG_GEMINI',
      );
    case 404:
      return new ErrorAnalisis(
        'El modelo de Gemini configurado no está disponible.',
        502,
        'MODELO_GEMINI',
      );
    default:
      return new ErrorAnalisis(
        'No se pudo conectar con Gemini. Intentá de nuevo en unos minutos.',
        502,
        'CONEXION_GEMINI',
      );
  }
}

export async function analizarOpiniones(datos) {
  const contenido = construirContenido(datos);

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    let texto;

    try {
      texto = await generarJSON({
        instrucciones: INSTRUCCIONES,
        contenido,
        esquema: ESQUEMA_RESPUESTA,
      });
    } catch (error) {
      if (error instanceof ErrorAnalisis) throw error;
      console.error(`[Gemini] Error ${error?.status ?? ''}: ${error?.message}`);
      throw traducirErrorGemini(error);
    }

    const respuesta = parsearRespuesta(texto);
    const { errores } = validarRespuesta(respuesta, datos.opiniones);

    if (errores.length === 0) {
      return construirResultado(datos, respuesta);
    }

    console.warn(`[Gemini] Respuesta inválida (intento ${intento}/${MAX_INTENTOS}):`, errores);
  }

  throw new ErrorAnalisis(
    'Gemini devolvió una respuesta incompleta o con formato inválido. Intentá de nuevo.',
    502,
    'RESPUESTA_INVALIDA',
  );
}