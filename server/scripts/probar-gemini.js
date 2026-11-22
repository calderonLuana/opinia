import 'dotenv/config';
import { generarTexto, obtenerModelo } from '../services/geminiService.js';

console.log(`Modelo: ${obtenerModelo()}`);

try {
  const texto = await generarTexto(
    'Respondé en una sola frase corta: ¿para qué sirve analizar las opiniones de los asistentes a un congreso?',
  );
  console.log(`\nRespuesta de Gemini:\n${texto}`);
} catch (error) {
  console.error('\nError al llamar a Gemini:');
  console.error(`Estado: ${error.status ?? 'sin código'}`);
  console.error(`Mensaje: ${error.message}`);
  process.exitCode = 1;
}