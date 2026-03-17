const db = require('../db/queries');

async function genresGet(req, res) {
  const genres = await db.getAllGenres();
  res.render('genres', {
    title: 'Game Genres',
    genres: genres,
  });
}

async function gamesByGenreGet(req, res) {
  const genreId = req.params.id;
  const games = await db.getAllGamesByGenre(genreId);
  const genreName = await db.getGenreName(genreId);
  res.render('genreGames', {
    title: `Games in ${genreName}`,
    games: games,
    genreName: genreName,
  });
}

module.exports = { genresGet, gamesByGenreGet };