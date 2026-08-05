const { Router } = require('express');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { registroSchema, loginSchema } = require('../validators/auth.validator');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', validate(registroSchema), controller.registrar);
router.post('/login', validate(loginSchema), controller.login);
router.get('/eu', requireAuth, controller.eu);

module.exports = router;
