const { Router } = require('express');
const router = Router();

const {
  developersGet,
  gamesByDevGet,
} = require('../controllers/developersController');

router.get('/', developersGet);
router.get('/new', (req, res) => {
  res.render('newDeveloper', {
    title: 'The Game Inventory: Add New Developer',
  });
});
router.get('/:id', gamesByDevGet);

module.exports = router;