export class ErrorAnalisis extends Error {
  constructor(mensaje, status = 500, codigo = 'ERROR_INTERNO') {
    super(mensaje);
    this.name = 'ErrorAnalisis';
    this.status = status;
    this.codigo = codigo;
  }
}