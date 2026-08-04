const { Router } = require('express');
const validate = require('../middlewares/validate.middleware');
const { calendarioSchema } = require('../validators/calendario.validator');
const controller = require('../controllers/calendario.controller');

const router = Router();

router.get('/', validate(calendarioSchema), controller.listar);

module.exports = router;
