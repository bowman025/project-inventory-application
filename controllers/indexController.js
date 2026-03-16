const db = require('../db/queries');

async function listGames(req, res) {
  const games = await db.getAllGames();
  res.render('index', { title: 'Game Inventory', games: games });
}

module.exports = { listGames, };