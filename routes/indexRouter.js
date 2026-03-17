const { Router } = require('express');
const router = Router();

const {
  gameGet,
} = require('../controllers/indexController');

router.get('/', gameGet);

module.exports = router;