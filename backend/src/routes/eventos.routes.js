const { Router } = require('express');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
  criarEventoSchema,
  atualizarEventoSchema,
  eventoIdSchema,
  listarEventosSchema,
} = require('../validators/evento.validator');
const controller = require('../controllers/eventos.controller');

const router = Router();

router.get('/', validate(listarEventosSchema), controller.listar);
router.post('/', requireAuth, validate(criarEventoSchema), controller.criar);
router.get('/:id', validate(eventoIdSchema), controller.buscar);
router.put('/:id', requireAuth, validate(atualizarEventoSchema), controller.atualizar);
router.delete('/:id', requireAuth, validate(eventoIdSchema), controller.deletar);

module.exports = router;
