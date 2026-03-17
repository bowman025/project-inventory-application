const db = require('../db/queries');

async function gamesGet(req, res) {
  const search = req.query.search?.trim();
  if (search) {
    const results = await db.searchGame(search);
    res.render('index', {
      title: 'Search Results',
      results: results,
      isSearch: true,
    });
  } else {
    const games = await db.getAllGames();
    res.render('index', { 
      title: 'Game Inventory', 
      games: games,
      isSearch: false, 
    });
  }
}

module.exports = { gamesGet, };