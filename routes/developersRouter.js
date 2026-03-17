const { Router } = require('express');
const router = Router();

const {
  developersGet,
  gamesByDevGet,
} = require('../controllers/developersController');

router.get('/', developersGet);
router.get('/:id/games', gamesByDevGet);

module.exports = router;