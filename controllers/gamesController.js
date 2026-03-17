const db = require('../db/queries');

async function gamesGet(req, res) {
  const games = await db.getAllGames();
  res.render('games', { 
    title: 'Game Inventory', 
    games: games,
  });
}

module.exports = { gamesGet, };