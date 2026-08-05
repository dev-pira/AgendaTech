const { Router } = require('express');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
  criarComunidadeSchema,
  atualizarComunidadeSchema,
  comunidadeIdSchema,
  listarComunidadesSchema,
} = require('../validators/comunidade.validator');
const { listarEventosPorComunidadeSchema } = require('../validators/evento.validator');
const { listarMembrosSchema, adicionarMembroSchema, atualizarPapelSchema, removerMembroSchema } =
  require('../validators/membro.validator');
const comunidadesController = require('../controllers/comunidades.controller');
const eventosController = require('../controllers/eventos.controller');
const membrosController = require('../controllers/membros.controller');

const router = Router();

router.get('/', validate(listarComunidadesSchema), comunidadesController.listar);
router.post('/', requireAuth, validate(criarComunidadeSchema), comunidadesController.criar);
router.get('/:id', validate(comunidadeIdSchema), comunidadesController.buscar);
router.put('/:id', requireAuth, validate(atualizarComunidadeSchema), comunidadesController.atualizar);
router.delete('/:id', requireAuth, validate(comunidadeIdSchema), comunidadesController.deletar);

// Aninhadas
router.get(
  '/:id/eventos',
  validate(listarEventosPorComunidadeSchema),
  eventosController.listarPorComunidade,
);
router.get('/:id/membros', requireAuth, validate(listarMembrosSchema), membrosController.listar);
router.post(
  '/:id/membros',
  requireAuth,
  validate(adicionarMembroSchema),
  membrosController.adicionar,
);
router.patch(
  '/:id/membros/:usuario_id/papel',
  requireAuth,
  validate(atualizarPapelSchema),
  membrosController.atualizarPapel,
);
router.delete(
  '/:id/membros/:usuario_id',
  requireAuth,
  validate(removerMembroSchema),
  membrosController.remover,
);

module.exports = router;
