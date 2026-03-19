const db = require('../db/queries');
const formatDateTime = require('../utils/formatDateTime');

async function gamesGet(req, res) {
  const games = await db.getAllGames();
  res.render('games', { 
    title: 'The Game Inventory: Games', 
    games: games,
  });
}

async function gameGet(req, res) {
  const gameId = req.params.id;
  const game = await db.getGame(gameId);
  const formatted = {
    ...game, 
    release_date: formatDateTime(game.release_date) 
  };
  res.render('gameDetail', {
    title: `The Game Inventory: ${formatted.name}`,
    game: formatted,
  });
}

module.exports = { gamesGet, gameGet };