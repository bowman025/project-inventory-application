const { Router } = require('express');
const router = Router();

const {
  gamesGet,
} = require('../controllers/indexController');

router.get('/', gamesGet);

module.exports = router;