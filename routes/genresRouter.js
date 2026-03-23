const { Router } = require('express');
const router = Router();

const {
  genresGet,
  gamesByGenreGet,
  genreDeletePost,
} = require('../controllers/genresController');

router.get('/', genresGet);
router.get('/new', (req, res) => {
  res.render('newGenre', {
    title: 'The Game Inventory: Add New Genre',
  });
});
router.get('/:id', gamesByGenreGet);
router.post('/:id/delete', genreDeletePost);

module.exports = router;