const ApiError = require('../utils/ApiError');

/**
 * Valida req.{body,query,params} contra um schema Zod no formato
 * z.object({ body, query, params }) e substitui os valores originais
 * pelos já parseados/coeridos (ex.: "pagina" string -> number).
 */
function validate(schema) {
  return function validateMiddleware(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const detalhes = result.error.issues.map((issue) => ({
        campo: issue.path.slice(1).join('.') || issue.path.join('.'),
        mensagem: issue.message,
      }));
      return next(new ApiError(400, 'Dados inválidos', detalhes));
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.query !== undefined) req.query = result.data.query;
    if (result.data.params !== undefined) req.params = result.data.params;
    next();
  };
}

module.exports = validate;
