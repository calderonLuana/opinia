
import { ErrorAnalisis } from '../utils/errores.js';

function escaparHTML(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function mostrarFecha(fecha) {
  if (!fecha) return 'No especificada';

  const valor = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ? `${fecha}T12:00:00`
    : fecha;

  const fechaValida = new Date(valor);

  if (Number.isNaN(fechaValida.getTime())) return escaparHTML(fecha);

  return fechaValida.toLocaleDateString('es-AR');
}

function construirInformeHTML(analisis) {
  const evento = analisis.evento ?? {};
  const resumen = analisis.resumen ?? {};
  const opiniones = Array.isArray(analisis.detalle?.opiniones)
    ? analisis.detalle.opiniones
    : [];

  const sentimientos = resumen.sentimientos ?? {};
  const totalOpiniones = resumen.totalOpiniones ?? opiniones.length;

  const nombresSentimientos = {
    positivo: 'Positivo',
    negativo: 'Negativo',
    neutro: 'Neutro',
    mixto: 'Mixto',
  };

  const filasSentimientos = Object.entries(nombresSentimientos)
    .map(([clave, nombre]) => {
      const datos = sentimientos[clave] ?? {};
      const cantidad = datos.cantidad ?? 0;
      const porcentaje = datos.porcentaje ?? 0;

      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${nombre}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${cantidad}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${porcentaje}%</td>
        </tr>
      `;
    })
    .join('');

  const conteoTemas = {};

  opiniones.forEach((opinion) => {
    const tema = String(opinion.tema ?? '').trim();

    if (tema) {
      conteoTemas[tema] = (conteoTemas[tema] ?? 0) + 1;
    }
  });

  const temas = Object.entries(conteoTemas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const listaTemas = temas.length
    ? temas
        .map(
          ([tema, cantidad]) =>
            `<li style="margin-bottom:6px;">${escaparHTML(tema)} (${cantidad})</li>`,
        )
        .join('')
    : '<li>No se identificaron temas.</li>';

  const comentarios = opiniones.slice(0, 10);

  const listaComentarios = comentarios.length
    ? comentarios
        .map((opinion) => `
          <li style="margin-bottom:14px;">
            <strong>${escaparHTML(opinion.sentimiento ?? 'Sin clasificar')}</strong>
            ${opinion.tema ? ` — ${escaparHTML(opinion.tema)}` : ''}
            <p style="margin:5px 0;">${escaparHTML(opinion.texto ?? '')}</p>
            ${
              opinion.justificacion
                ? `<p style="margin:5px 0;color:#6b7280;"><em>${escaparHTML(opinion.justificacion)}</em></p>`
                : ''
            }
          </li>
        `)
        .join('')
    : '<li>No hay comentarios disponibles.</li>';

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informe de OpinIA</title>
      </head>
      <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;color:#1f2937;">
        <main style="max-width:700px;margin:0 auto;background:#ffffff;padding:28px;border-radius:12px;">
          <h1 style="margin-top:0;color:#6d28d9;">Informe de OpinIA</h1>
          <p>Se generó el informe del análisis solicitado.</p>

          <h2 style="color:#4b5563;">Datos del evento</h2>
          <p><strong>Nombre:</strong> ${escaparHTML(evento.nombre ?? 'Sin nombre')}</p>
          <p><strong>Fecha:</strong> ${mostrarFecha(evento.fecha)}</p>
          <p><strong>Tipo:</strong> ${escaparHTML(evento.tipo ?? 'No especificado')}</p>
          <p><strong>Institución:</strong> ${escaparHTML(evento.institucion ?? 'No especificada')}</p>

          <h2 style="color:#4b5563;">Resumen del análisis</h2>
          <p><strong>Total de opiniones:</strong> ${escaparHTML(totalOpiniones)}</p>

          <table style="width:100%;border-collapse:collapse;text-align:left;">
            <thead>
              <tr>
                <th style="padding:8px;background:#f3f4f6;">Sentimiento</th>
                <th style="padding:8px;background:#f3f4f6;">Cantidad</th>
                <th style="padding:8px;background:#f3f4f6;">Porcentaje</th>
              </tr>
            </thead>
            <tbody>${filasSentimientos}</tbody>
          </table>

          <h2 style="color:#4b5563;">Temas más frecuentes</h2>
          <ul>${listaTemas}</ul>

          <h2 style="color:#4b5563;">Opiniones analizadas</h2>
          <ol>${listaComentarios}</ol>

          <p style="margin-top:28px;color:#6b7280;font-size:12px;">
            Informe generado automáticamente por OpinIA.
          </p>
        </main>
      </body>
    </html>
  `;
}

export async function enviarInformePorCorreo(analisis, email) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL?.trim();
  const secreto = process.env.MAKE_WEBHOOK_SECRET?.trim();

  if (!webhookUrl || !secreto) {
    throw new ErrorAnalisis(
      'El envío de informes todavía no está configurado.',
      503,
      'CONFIG_INFORMES',
    );
  }

  const nombreEvento = analisis.evento?.nombre || 'tu evento';
  const asunto = `Informe de OpinIA - ${nombreEvento}`;
  const html = construirInformeHTML(analisis);

  let respuesta;

  try {
    respuesta = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secreto,
        email,
        subject: asunto,
        html,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const esTimeout = error.name === 'TimeoutError';

    console.error('[Informe] No se pudo contactar con Make:', error.message);

    throw new ErrorAnalisis(
      esTimeout
        ? 'El servicio de envío tardó demasiado en responder. Intentá de nuevo.'
        : 'No se pudo conectar con el servicio de envío. Intentá de nuevo.',
      502,
      'ERROR_MAKE',
    );
  }

  if (!respuesta.ok) {
    console.error('[Informe] Make respondió con un error HTTP:', respuesta.status);

    throw new ErrorAnalisis(
      'El servicio de envío no pudo procesar el informe.',
      502,
      'ERROR_MAKE',
    );
  }
}
