const { query, validationResult } = require('express-validator');
const db = require('../db/queries');

const validateSearch = [
  query('search')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Search must be between 1 and 50 characters.')
    .escape()
];

async function indexGameGet(req, res) {
  const errors = validationResult(req);
  const search = req.query.search;

  if (!errors.isEmpty() || !search) {
    const highlight = await db.getRandomHighlights();
    return res.render('index', { 
      title: 'The Game Inventory', 
      highlight: highlight,
      isSearch: false, 
    });
  }

  const results = await db.searchGame(search);
  res.render('index', {
    title: `Results for "${search}"`,
    results: results,
    isSearch: true,
  });
}

module.exports = { 
  indexGameGet: [validateSearch, indexGameGet] 
};