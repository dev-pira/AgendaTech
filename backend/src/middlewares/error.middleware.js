const ApiError = require('../utils/ApiError');

function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const exposeMessage = statusCode < 500 || process.env.NODE_ENV !== 'production';

  const body = {
    erro: {
      mensagem: exposeMessage ? err.message : 'Erro interno do servidor',
    },
  };
  if (err.details) body.erro.detalhes = err.details;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
