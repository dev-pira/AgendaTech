const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

/**
 * Traduz erros conhecidos do Prisma (violações de constraint que escapam das
 * checagens prévias em cenário de corrida — dois requests concorrentes passam
 * ambos pelo findFirst antes de qualquer um dos dois commitar o create/update)
 * em ApiError com status e mensagem apropriados, em vez de vazar como 500 cru.
 *
 * Achado em auditoria: sem isso, duas criações simultâneas de comunidade/evento
 * com o mesmo nome/título tinham ~90% de chance de retornar 500 com o caminho
 * do arquivo e trecho de código-fonte do servidor no corpo da resposta.
 */
function mapPrismaError(err) {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;

  switch (err.code) {
    case 'P2002': {
      const campos = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'campo(s) único(s)';
      return new ApiError(409, `Já existe um registro com o mesmo valor para: ${campos}`);
    }
    case 'P2025':
      return new ApiError(404, 'Registro não encontrado');
    case 'P2003':
      return new ApiError(409, 'Operação viola uma referência existente (chave estrangeira)');
    default:
      return null;
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const mapped = mapPrismaError(err) || err;
  const statusCode = mapped instanceof ApiError ? mapped.statusCode : mapped.statusCode || 500;

  // Erros 5xx nunca expõem a mensagem original ao cliente (pode conter caminho
  // de arquivo, trecho de query, stack) — só vão para o log do servidor.
  // Erros <500 (incluindo os mapeados acima) usam mensagens já pensadas para
  // serem lidas pelo cliente da API.
  const body = {
    erro: {
      mensagem: statusCode < 500 ? mapped.message : 'Erro interno do servidor',
    },
  };
  if (mapped.details) body.erro.detalhes = mapped.details;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler, mapPrismaError };
