/**
 * Erro de aplicação com status HTTP embutido. Lançado nos services/controllers
 * e traduzido para JSON padronizado pelo error.middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
