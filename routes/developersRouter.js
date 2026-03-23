const { Router } = require('express');
const router = Router();

const {
  developersGet,
  gamesByDevGet,
  developerAddPost,
  developerEditPost,
  developerDeletePost,
} = require('../controllers/developersController');

router.get('/', developersGet);
router.post('/', developerAddPost);
router.get('/:id', gamesByDevGet);
router.post('/:id/edit', developerEditPost);
router.post('/:id/delete', developerDeletePost);

module.exports = router;