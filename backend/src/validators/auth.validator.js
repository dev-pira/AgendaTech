const { z } = require('zod');

const registroSchema = z.object({
  body: z.object({
    nome: z.string().trim().min(3, 'nome deve ter ao menos 3 caracteres').max(100),
    email: z.string().trim().toLowerCase().email('email inválido').max(255),
    senha: z.string().min(6, 'senha deve ter ao menos 6 caracteres').max(72),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('email inválido'),
    senha: z.string().min(1, 'senha é obrigatória'),
  }),
});

module.exports = { registroSchema, loginSchema };
