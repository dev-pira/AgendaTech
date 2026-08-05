const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/comunidades', require('./comunidades.routes'));
router.use('/eventos', require('./eventos.routes'));
router.use('/calendario', require('./calendario.routes'));

module.exports = router;
