const { Router } = require('express');
const router = Router();

const {
  gamesGet,
  gameGet,
  gameAddPost,
  gameEditPost,
  gameDeletePost,
} = require('../controllers/gamesController');

router.get('/', gamesGet);
router.post('/', gameAddPost);
router.get('/:id', gameGet);
router.post('/:id/edit', gameEditPost);
router.post('/:id/delete', gameDeletePost);

module.exports = router;