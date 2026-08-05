const { z } = require('zod');
const { paginacaoSchema, uuidSchema } = require('./common');

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

function hojeSemHora() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

const corpoEventoBase = {
  titulo: z.string().trim().min(5, 'titulo deve ter entre 5 e 200 caracteres').max(200),
  descricao: z.string().trim().min(20, 'descricao deve ter ao menos 20 caracteres'),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve estar no formato YYYY-MM-DD')
    .refine((valor) => !Number.isNaN(Date.parse(valor)), 'data inválida')
    .refine((valor) => new Date(valor) >= hojeSemHora(), 'data deve ser hoje ou futura'),
  hora_inicio: z.string().regex(horaRegex, 'hora_inicio deve estar no formato HH:mm'),
  hora_fim: z.string().regex(horaRegex, 'hora_fim deve estar no formato HH:mm').optional(),
  local: z.string().trim().min(3).max(300),
  tipo: z.enum(['presencial', 'online', 'hibrido'], {
    errorMap: () => ({ message: 'tipo deve ser presencial, online ou hibrido' }),
  }),
  url_online: z.string().trim().url('url_online deve ser uma URL válida').max(500).optional(),
  comunidade_id: uuidSchema,
};

// RN-EVT-05: hora_fim > hora_inicio ; RN-EVT-06: url_online obrigatória se online/hibrido
function aplicarRegrasCruzadas(schema) {
  return schema
    .refine((dados) => !dados.hora_fim || dados.hora_fim > dados.hora_inicio, {
      message: 'hora_fim deve ser depois de hora_inicio',
      path: ['hora_fim'],
    })
    .refine((dados) => dados.tipo === 'presencial' || Boolean(dados.url_online), {
      message: 'url_online é obrigatória quando tipo é online ou hibrido',
      path: ['url_online'],
    });
}

const criarEventoSchema = z.object({
  body: aplicarRegrasCruzadas(z.object(corpoEventoBase)),
});

// Em atualização parcial, as regras cruzadas só fazem sentido quando os
// campos relevantes estão presentes; a checagem completa é refeita no
// service após o merge com o registro existente.
const atualizarEventoSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object(corpoEventoBase).partial(),
});

const eventoIdSchema = z.object({
  params: z.object({ id: uuidSchema }),
});

const listarEventosSchema = z.object({
  query: paginacaoSchema.extend({
    comunidade_id: uuidSchema.optional(),
    cidade: z.string().trim().min(1).optional(),
    data_inicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'data_inicio deve estar no formato YYYY-MM-DD')
      .optional(),
    data_fim: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'data_fim deve estar no formato YYYY-MM-DD')
      .optional(),
    tipo: z.enum(['presencial', 'online', 'hibrido']).optional(),
  }),
});

const listarEventosPorComunidadeSchema = z.object({
  params: z.object({ id: uuidSchema }),
  query: paginacaoSchema,
});

module.exports = {
  criarEventoSchema,
  atualizarEventoSchema,
  eventoIdSchema,
  listarEventosSchema,
  listarEventosPorComunidadeSchema,
  horaRegex,
};
