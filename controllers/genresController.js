const { 
  body, 
  validationResult, 
  matchedData, 
} = require('express-validator');
const db = require('../db/queries');
const cleanIds = require('../utils/cleanIds');
const CustomValidationError = require('../errors/CustomValidationError');

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
  try {
    const { genre } = req.body;
    await db.addGenre(genre);
    res.redirect('/genres');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function genreEditPost(req, res, next) {
  try {
    const { id } = req.params;
    const { name, password } = req.body;
    const gameIds = cleanIds(req.body.gameIds);
    const allGameIds = cleanIds(req.body.allGameIds);
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.updateGenre(id, name, gameIds, allGameIds);
    res.redirect(`/genres/${id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function genreDeletePost(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
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
  genreAddPost,
  genreEditPost,
  genreDeletePost,
};