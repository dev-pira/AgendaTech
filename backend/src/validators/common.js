const { z } = require('zod');

const paginacaoSchema = z.object({
  pagina: z.coerce.number().int('pagina deve ser um número inteiro').min(1).optional().default(1),
  limite: z.coerce
    .number()
    .int('limite deve ser um número inteiro')
    .min(1)
    .max(100, 'limite máximo é 100')
    .optional()
    .default(20),
});

const uuidSchema = z.string().uuid({ message: 'deve ser um UUID válido' });

module.exports = { paginacaoSchema, uuidSchema };
