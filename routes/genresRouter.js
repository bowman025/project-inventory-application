const { Router } = require('express');
const router = Router();

const {
  genresGet,
  gamesByGenreGet,
} = require('../controllers/genresController');

router.get('/', genresGet);
router.get('/:id', gamesByGenreGet)

module.exports = router;