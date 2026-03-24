const db = require('../db/queries');
const formatDateTime = require('../utils/formatDateTime');
const CustomValidationError = require('../errors/CustomValidationError');

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
  const devs = await db.getAllDevelopers();
  const filteredDevs = devs.filter(dev => !game.developer_list.includes(dev));
  const genres = await db.getAllGenres();
  const filteredGenres = genres.filter(genre => !game.genre_list.includes(genre));
  const formatted = {
    ...game, 
    release_date: formatDateTime(game.release_date) 
  };
  res.render('gameDetail', {
    title: `The Game Inventory: ${formatted.name}`,
    game: formatted,
    allDevs: filteredDevs,
    allGenres: filteredGenres,
  });
}

async function gameAddPost(req, res) {
  try {
    const { game } = req.body;
    await db.addGame(game);
    res.redirect('/games');
  } catch (error) {
    console.error(error);
  }
}

async function gameEditPost(req, res, next) {
  try {
    const { id } = req.params;
    const { name, password } = req.body;
    const genreIds = [req.body.genreIds].flat().filter(Boolean);
    const developerIds = [req.body.developerIds].flat().filter(Boolean);
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.updateGame(id, name);
    if (gameIds.length > 0) await db.removeGamesFromDev(id, gameIds);
    res.redirect(`/developers/${id}`);
  } catch (error) {
    console.error(error);
  }
}

async function gameDeletePost(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.deleteGame(id);
    res.redirect('/games');
  } catch (error) {
    console.error(error);
  }
}

module.exports = { 
  gamesGet, 
  gameGet,
  gameAddPost,
  gameEditPost,
  gameDeletePost, 
};