const pool = require('./pool');

async function getAllGames() {
  const { rows } = await pool.query('SELECT * FROM games');
  return rows;
}

async function getAllDevelopers() {
  const { rows } = await pool.query('SELECT * FROM developers');
  return rows;
}

async function getAllGenres() {
  const { rows } = await pool.query('SELECT * FROM genres');
  return rows;
}

async function getGame(id) {
  const { rows } = await pool.query(
    'SELECT * FROM games WHERE id = $1',
    [id]
  );
  return rows[0];
}

async function getAllGamesByDev(id) {
  const query = `
    SELECT g.name, g.release_date, g.rating
    FROM games g
    JOIN game_developers gd ON g.id = gd.game_id
    WHERE gd.developer_id = $1
    ORDER BY g.release_date DESC;
  `;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows;
  } catch (error) {
    console.error('Query failed', error);
  }
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

async function searchGame(term) {
  const { rows } = await pool.query(
    'SELECT * FROM games WHERE name ILIKE $1',
    [`%${term}%`]
  );
  return rows;
}

module.exports = {
  getAllGames,
  getAllDevelopers,
  getAllGenres,
  getGame,
  getAllGamesByDev,
  addGame,
  searchGame,
}