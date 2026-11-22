const MENSAJES = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed:
    'Todavía no confirmaste tu correo. Revisá tu bandeja de entrada y la carpeta de spam.',
  user_already_exists:
    'Ese correo ya está registrado. Iniciá sesión o recuperá tu contraseña.',
  email_exists: 'Ese correo ya está registrado. Iniciá sesión o recuperá tu contraseña.',
  weak_password: 'La contraseña es muy débil. Usá al menos 8 caracteres.',
  same_password: 'La nueva contraseña debe ser distinta de la anterior.',
  email_address_invalid: 'El correo electrónico no es válido.',
  signup_disabled: 'El registro de cuentas nuevas está deshabilitado.',
  over_email_send_rate_limit:
    'Se enviaron demasiados correos en poco tiempo. Esperá unos minutos e intentá de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Esperá un momento e intentá de nuevo.',
};

export function traducirErrorAuth(error) {
  const porCodigo = MENSAJES[error?.code];
  if (porCodigo) return porCodigo;

  const mensaje = String(error?.message ?? '').toLowerCase();

  if (mensaje.includes('invalid login credentials')) return MENSAJES.invalid_credentials;
  if (mensaje.includes('email not confirmed')) return MENSAJES.email_not_confirmed;
  if (mensaje.includes('already registered')) return MENSAJES.user_already_exists;
  if (mensaje.includes('rate limit')) return MENSAJES.over_email_send_rate_limit;
  if (mensaje.includes('not authorized')) {
    return 'No se pudo enviar el correo: el servicio de correo de prueba solo envía a los miembros del proyecto. Hay que configurar un servicio de correo propio.';
  }
  if (mensaje.includes('failed to fetch')) {
    return 'No se pudo conectar con el servicio de cuentas. Verificá tu conexión.';
  }

  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}