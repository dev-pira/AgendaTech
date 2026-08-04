const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const eventosService = require('../services/eventos.service');

const listar = asyncHandler(async (req, res) => {
  const { data_inicio, data_fim, comunidade_id, cidade, tipo } = req.query;
  const where = eventosService.montarFiltros({
    comunidade_id,
    cidade,
    tipo,
    data_inicio,
    data_fim,
  });

  const eventos = await prisma.evento.findMany({
    where,
    orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
    include: { comunidade: { select: { id: true, nome: true, cidade: true } } },
  });

  res.status(200).json({
    eventos: eventos.map(eventosService.serializar),
    total: eventos.length,
    periodo: { data_inicio, data_fim },
  });
});

module.exports = { listar };
