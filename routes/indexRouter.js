const { Router } = require('express');
const router = Router();

const {
  indexGameGet,
} = require('../controllers/indexController');

router.get('/', indexGameGet);

module.exports = router;