/**
 * Envolve um controller async para encaminhar rejeições ao errorHandler
 * do Express, sem precisar de try/catch repetido em cada rota.
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
