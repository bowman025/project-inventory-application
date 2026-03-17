const db = require('../db/queries');

async function genresGet(req, res) {
  const genres = await db.getAllGenres();
  res.render('genres', {
    title: 'Game Genres',
    genres: genres,
  });
}

module.exports = { genresGet, };