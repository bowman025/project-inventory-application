const { 
  body, 
  validationResult, 
  matchedData, 
} = require('express-validator');
const db = require('../db/queries');
const cleanIds = require('../utils/cleanIds');
const CustomValidationError = require('../errors/CustomValidationError');

const validateGenreName = body('genre')
  .trim()
  .isLength({ min: 1, max: 50 }).withMessage('Genre name must be between 1 and 50 characters.')
  .escape();

const validatePassword = body('password')
  .notEmpty().withMessage('Password is required');

async function genresGet(req, res, next) {
  try {
    const genres = await db.getAllGenres();
    res.render('genres', {
      title: 'The Game Inventory: Genres',
      genres: genres,
    });
  } catch (error) {
   console.error(error);
   next(error);
  }
}

async function gamesByGenreGet(req, res, next) {
  try {
    const genreId = req.params.id;
    const genreName = await db.getGenreName(genreId);
    const games = await db.getAllGamesInGenre(genreId);
    const allGames = await db.getAllGamesNotInGenre(genreId);
    res.render('genreDetail', {
      title: `The Game Inventory: Games in ${genreName}`,
      games: games,
      allGames: allGames,
      genreName: genreName,
      genreId: genreId,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function genreAddPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const data = matchedData(req);
    await db.addGenre(data.genre);
    res.redirect('/genres');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function genreEditPost(req, res, next) {
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

    const gameIds = cleanIds(req.body.gameIds);
    const allGameIds = cleanIds(req.body.allGameIds);

    await db.updateGenre(id, data.genre, gameIds, allGameIds);
    res.redirect(`/genres/${id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function genreDeletePost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const { id } = req.params;
    const data = matchedData(req);

    if (data.password !== process.env.ADMIN_PASS) {
      return next(new CustomValidationError('Invalid password. Deletion aborted.'));
    }

    await db.deleteGenre(id);
    res.redirect('/genres');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = { 
  genresGet, 
  gamesByGenreGet, 
  genreAddPost: [validateGenreName, genreAddPost],
  genreEditPost: [validateGenreName, validatePassword, genreEditPost],
  genreDeletePost: [validatePassword, genreDeletePost],
};