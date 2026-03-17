const { Router } = require('express');
const router = Router();

const {
  gamesGet,
  gameGet,
} = require('../controllers/gamesController');

router.get('/', gamesGet);
router.get('/new', (req, res) => {
  res.render('newGame', {
    title: 'The Game Inventory: Add New Game',
  });
});
router.get('/:id', gameGet);

module.exports = router;