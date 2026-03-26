const db = require('../db/queries');
const formatDateTime = require('../utils/formatDateTime');
const cleanIds = require('../utils/cleanIds');
const CustomValidationError = require('../errors/CustomValidationError');
const CustomNotFoundError = require('../errors/CustomNotFoundError');

async function gamesGet(req, res, next) {
  try {
    const games = await db.getAllGames();
    res.render('games', { 
      title: 'The Game Inventory: Games', 
      games: games,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function gameGet(req, res, next) {
  try {
    const gameId = req.params.id;
    const game = await db.getGame(gameId);
    if (!game) {
      return next(new CustomNotFoundError('The requested game was not found.'));
    }
    const devs = await db.getAllDevelopers();
    const currentDevIds = game.developer_list.map(d => d.id); 
    const filteredDevs = devs.filter(dev => !currentDevIds.includes(dev.id));
    const genres = await db.getAllGenres();
    const currentGenreIds = game.genre_list.map(g => g.id);
    const filteredGenres = genres.filter(genre => !currentGenreIds.includes(genre.id));
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
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function gameAddPost(req, res, next) {
  try {
    const { steamId } = req.body;
    const newId = await db.addGame(steamId);
    res.redirect(`/games/${newId}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function gameEditPost(req, res, next) {
  try {
    const { id } = req.params;
    const { 
      name,
      description,
      release_date,
      rating, 
      password } = req.body;
    const genreIds = cleanIds(req.body.genreIds);
    const allGenreIds = cleanIds(req.body.allGenreIds);
    const developerIds = cleanIds(req.body.developerIds);
    const allDeveloperIds = cleanIds(req.body.allDeveloperIds);
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.updateGame(
      id, name, description, release_date, rating,
      developerIds, allDeveloperIds,
      genreIds, allGenreIds
    );
    res.redirect(`/games/${id}`);
  } catch (error) {
    console.error(error);
    next(error);
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
    next(error);
  }
}

module.exports = { 
  gamesGet, 
  gameGet,
  gameAddPost,
  gameEditPost,
  gameDeletePost, 
};