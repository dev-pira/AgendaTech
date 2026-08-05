const { z } = require('zod');
const { paginacaoSchema, uuidSchema } = require('./common');

const adicionarMembroSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    email: z.string().trim().toLowerCase().email('email inválido'),
    papel: z.enum(['organizador', 'membro'], {
      errorMap: () => ({ message: 'papel deve ser organizador ou membro' }),
    }),
  }),
});

const atualizarPapelSchema = z.object({
  params: z.object({ id: uuidSchema, usuario_id: uuidSchema }),
  body: z.object({
    papel: z.enum(['organizador', 'membro']),
  }),
});

const removerMembroSchema = z.object({
  params: z.object({ id: uuidSchema, usuario_id: uuidSchema }),
});

const listarMembrosSchema = z.object({
  params: z.object({ id: uuidSchema }),
  query: paginacaoSchema.extend({
    papel: z.enum(['organizador', 'membro']).optional(),
  }),
});

module.exports = {
  adicionarMembroSchema,
  atualizarPapelSchema,
  removerMembroSchema,
  listarMembrosSchema,
};
