const { Router } = require('express');
const router = Router();

const {
  listGames,
} = require('../controllers/indexController');

router.get('/', listGames);

module.exports = router;