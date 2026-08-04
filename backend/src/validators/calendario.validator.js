const { z } = require('zod');
const { uuidSchema } = require('./common');

const calendarioSchema = z.object({
  query: z
    .object({
      data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data_inicio (YYYY-MM-DD) é obrigatório'),
      data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data_fim (YYYY-MM-DD) é obrigatório'),
      comunidade_id: uuidSchema.optional(),
      cidade: z.string().trim().min(1).optional(),
      tipo: z.enum(['presencial', 'online', 'hibrido']).optional(),
    })
    .refine((dados) => dados.data_fim >= dados.data_inicio, {
      message: 'data_fim deve ser igual ou depois de data_inicio',
      path: ['data_fim'],
    }),
});

module.exports = { calendarioSchema };
