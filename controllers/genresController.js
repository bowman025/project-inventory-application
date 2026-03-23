const db = require('../db/queries');
const CustomValidationError = require('../errors/CustomValidationError');

async function genresGet(req, res) {
  const genres = await db.getAllGenres();
  res.render('genres', {
    title: 'The Game Inventory: Genres',
    genres: genres,
  });
}

async function gamesByGenreGet(req, res) {
  const genreId = req.params.id;
  const games = await db.getAllGamesByGenre(genreId);
  const genreName = await db.getGenreName(genreId);
  res.render('genreDetail', {
    title: `The Game Inventory: Games in ${genreName}`,
    games: games,
    genreName: genreName,
    genreId: genreId,
  });
}

async function genreAddPost(req, res) {
  try {
    const { genre } = req.body;
    await db.addGenre(genre);
    res.redirect('/genres');
  } catch (error) {
    console.error(error);
  }
}

async function genreEditPost(req, res, next) {
  try {
    const { id } = req.params;
    const { name, password } = req.body;
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.updateGenre(id, name);
    res.redirect(`/genres/${id}`);
  } catch (error) {
    console.error(error);
  }
}

async function genreDeletePost(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return res.status(401).send('Invalid password. Deletion aborted.');
    }
    await db.deleteGenre(id);
    res.redirect('/genres');
  } catch (error) {
    console.error(error);
  }
}

module.exports = { 
  genresGet, 
  gamesByGenreGet, 
  genreAddPost,
  genreEditPost,
  genreDeletePost,
};