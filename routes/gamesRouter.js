const { Router } = require('express');
const router = Router();

const {
  gamesGet,
} = require('../controllers/gamesController');

router.get('/', gamesGet);

module.exports = router;