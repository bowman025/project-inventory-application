const { Router } = require('express');
const router = Router();

const {
  gamesGet,
  gameGet,
} = require('../controllers/gamesController');

router.get('/', gamesGet);
router.get('/:id', gameGet);

module.exports = router;