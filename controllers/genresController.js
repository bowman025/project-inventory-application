const db = require('../db/queries');

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
  });
}

async function genreDeletePost(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  const isValid = password === process.env.ADMIN_PASS;

  if (!isValid) {
    return res.status(401).send('Invalid password. Deletion aborted.');
  }

  await db.deleteGenre(id);
  res.redirect('/genres');
}

module.exports = { 
  genresGet, 
  gamesByGenreGet, 
  genreDeletePost,
};