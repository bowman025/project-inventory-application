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

async function gameDeletePost(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  const isValid = password === process.env.ADMIN_PASS;

  if (!isValid) {
    return res.status(401).send('Invalid password. Deletion aborted.');
  }

  await db.deleteGame(id);
  res.redirect('/games');
}

module.exports = { 
  gamesGet, 
  gameGet,
  gameDeletePost, 
};