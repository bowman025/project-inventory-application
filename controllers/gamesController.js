const db = require('../db/queries');

async function gamesGet(req, res) {
  const games = await db.getAllGames();
  res.render('games', { 
    title: 'Game Inventory', 
    games: games,
  });
}

async function gameGet(req, res) {
  const gameId = req.params.id;
  const game = await db.getGame(gameId);
  res.render('gameDetail', {
    title: game.name,
    game: game,
  });
}

module.exports = { gamesGet, gameGet };