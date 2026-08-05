const { z } = require('zod');
const { paginacaoSchema, uuidSchema } = require('./common');

function isEmailOuUrl(valor) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(valor)) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(valor);
    return true;
  } catch {
    return false;
  }
}

// RN-COM-04: contato deve ser email ou URL válido
const contatoSchema = z
  .string()
  .trim()
  .max(255, 'contato deve ter no máximo 255 caracteres')
  .refine(isEmailOuUrl, 'contato deve ser um e-mail ou URL válido');

// RN-COM-05: logo_url deve apontar para uma imagem
const logoUrlSchema = z
  .string()
  .trim()
  .url('logo_url deve ser uma URL válida')
  .max(500)
  .refine(
    (valor) => /\.(png|jpe?g|svg|webp)(\?.*)?$/i.test(valor),
    'logo_url deve apontar para uma imagem (.png, .jpg, .jpeg, .svg, .webp)',
  );

const corpoComunidade = {
  nome: z.string().trim().min(3, 'nome deve ter entre 3 e 100 caracteres').max(100),
  descricao: z.string().trim().min(10, 'descricao deve ter ao menos 10 caracteres'),
  cidade: z.string().trim().min(2).max(100),
  contato: contatoSchema,
  logo_url: logoUrlSchema.optional(),
};

const criarComunidadeSchema = z.object({
  body: z.object(corpoComunidade),
});

const atualizarComunidadeSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object(corpoComunidade).partial(),
});

const comunidadeIdSchema = z.object({
  params: z.object({ id: uuidSchema }),
});

const listarComunidadesSchema = z.object({
  query: paginacaoSchema.extend({
    cidade: z.string().trim().min(1).optional(),
  }),
});

module.exports = {
  criarComunidadeSchema,
  atualizarComunidadeSchema,
  comunidadeIdSchema,
  listarComunidadesSchema,
};
