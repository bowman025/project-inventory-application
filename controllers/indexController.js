const db = require('../db/queries');

async function gameGet(req, res) {
  const search = req.query.search?.trim();
  if (search) {
    const results = await db.searchGame(search);
    res.render('index', {
      title: 'Search Results',
      results: results,
      isSearch: true,
    });
  } else {
    const highlight = await db.getRandomHighlights();
    res.render('index', { 
      title: 'The Game Inventory', 
      highlight: highlight,
      isSearch: false, 
    });
  }
}

module.exports = { gameGet, };