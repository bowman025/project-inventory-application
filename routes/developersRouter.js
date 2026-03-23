const { Router } = require('express');
const router = Router();

const {
  developersGet,
  gamesByDevGet,
  developerDeletePost,
} = require('../controllers/developersController');

router.get('/', developersGet);
router.get('/new', (req, res) => {
  res.render('newDeveloper', {
    title: 'The Game Inventory: Add New Developer',
  });
});
router.get('/:id', gamesByDevGet);
router.post('/:id/delete', developerDeletePost);

module.exports = router;