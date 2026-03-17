const { Router } = require('express');
const router = Router();

const {
  genresGet,
} = require('../controllers/genresController');

router.get('/', genresGet);

module.exports = router;