const { 
  body, 
  validationResult, 
  matchedData, 
} = require('express-validator');
const db = require('../db/queries');
const formatDateTime = require('../utils/formatDateTime');
const cleanIds = require('../utils/cleanIds');
const CustomValidationError = require('../errors/CustomValidationError');
const CustomNotFoundError = require('../errors/CustomNotFoundError');

const validateSteamId = [
  body('steamId')
    .trim()
    .isNumeric().withMessage('Steam ID must be a number.')
    .notEmpty().withMessage('Steam ID is required')
];

const validateGameEdit = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Game name must be between 1 and 50 characters.')
    .escape(),
  body('description')
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be up to 500 characters.')
    .escape(),
  body('release_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date format.'),
  body('rating')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 }).withMessage('Rating must be between 0 and 100.')
];

const validatePassword = body('password')
  .notEmpty().withMessage('Password is required.');

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const data = matchedData(req);
    const newId = await db.addGame(data.steamId);
    res.redirect(`/games/${newId}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function gameEditPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const { id } = req.params;
    const data = matchedData(req);

    if (data.password !== process.env.ADMIN_PASS) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }

    const genreIds = cleanIds(req.body.genreIds);
    const allGenreIds = cleanIds(req.body.allGenreIds);
    const developerIds = cleanIds(req.body.developerIds);
    const allDeveloperIds = cleanIds(req.body.allDeveloperIds);

    await db.updateGame(
      id, data.name, data.description, data.release_date, data.rating,
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const { id } = req.params;
    const data = matchedData(req);

    if (data.password !== process.env.ADMIN_PASS) {
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
  gameAddPost: [...validateSteamId, gameAddPost],
  gameEditPost: [...validateGameEdit, validatePassword, gameEditPost],
  gameDeletePost: [validatePassword, gameDeletePost], 
};