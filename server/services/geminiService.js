import { GoogleGenAI } from '@google/genai';
import { ErrorAnalisis } from '../utils/errores.js';

const MODELO_POR_DEFECTO = 'gemini-3.5-flash-lite';

let cliente = null;

function obtenerCliente() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new ErrorAnalisis(
      'Falta configurar la API Key de Gemini en el servidor.',
      500,
      'CONFIG_GEMINI',
    );
  }
  if (!cliente) {
    cliente = new GoogleGenAI({ apiKey });
  }
  return cliente;
}

export function obtenerModelo() {
  return process.env.GEMINI_MODEL?.trim() || MODELO_POR_DEFECTO;
}

export async function generarTexto(prompt) {
  const ai = obtenerCliente();
  const respuesta = await ai.models.generateContent({
    model: obtenerModelo(),
    contents: prompt,
  });
  return respuesta.text;
}

export async function generarJSON({ instrucciones, contenido, esquema }) {
  const ai = obtenerCliente();
  const respuesta = await ai.models.generateContent({
    model: obtenerModelo(),
    contents: contenido,
    config: {
      systemInstruction: instrucciones,
      responseMimeType: 'application/json',
      responseJsonSchema: esquema,
      temperature: 0.2,
    },
  });
  return respuesta.text;
}