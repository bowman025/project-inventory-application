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
  const query = `
    SELECT 
      g.*,
      ARRAY_AGG(DISTINCT d.name) AS developer_names,
      ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('id', gen.id, 'name', gen.name)) AS genre_list
    FROM games g
    LEFT JOIN game_developers gd ON g.id = gd.game_id
    LEFT JOIN developers d ON gd.developer_id = d.id
    LEFT JOIN game_genres gg ON g.id = gg.game_id
    LEFT JOIN genres gen ON gg.genre_id = gen.id
    WHERE g.id = $1
    GROUP BY g.id;
  `;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  } catch (error) {
    console.error('Query failed', error);
  }
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

async function getAllGamesByGenre(id) {
  const query = `
    SELECT g.*, ARRAY_AGG(d.name) AS developer_names
    FROM games g
    JOIN game_genres gg ON g.id = gg.game_id
    LEFT JOIN game_developers gd ON g.id = gd.game_id
    LEFT JOIN developers d ON gd.developer_id = d.id
    WHERE gg.genre_id = $1
    GROUP BY g.id
    ORDER BY g.rating DESC;
  `;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows;
  } catch (error) {
    console.error('Query failed', error);
  }
}

async function getGenreName(id) {
  const { rows } = await pool.query('SELECT name FROM genres WHERE id = $1', [id]);
  return rows[0]?.name || 'Unknown Genre';
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
  getAllGamesByGenre,
  getGenreName,
  addGame,
  searchGame,
}