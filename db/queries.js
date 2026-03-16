const pool = require('./pool');

async function getAllGames() {
  const { rows } = await pool.query('SELECT * FROM games');
  return rows;
}

async function findGame(id) {
  const { rows } = await pool.query(
    'SELECT * FROM games WHERE id = $1',
    [id]
  );
  return rows[0];
}

async function addGame(values) {
  const {
    steam_id,
    name,
    description,
    release_date,
    rating,
    image,
    background,
  } = values;
  await pool.query(
    `INSERT INTO games (name, description, release_date)
    VALUES ($1, $2, $3)`,
    [name, description, release_date]
  );
}

module.exports = {
  getAllGames,
  findGame,
  addGame,
}