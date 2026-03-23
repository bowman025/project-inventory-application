const { Router } = require('express');
const router = Router();

const {
  genresGet,
  gamesByGenreGet,
  genreAddPost,
  genreEditPost,
  genreDeletePost,
} = require('../controllers/genresController');

router.get('/', genresGet);
router.post('/', genreAddPost);
router.get('/:id', gamesByGenreGet);
router.post('/:id/edit', genreEditPost);
router.post('/:id/delete', genreDeletePost);

module.exports = router;