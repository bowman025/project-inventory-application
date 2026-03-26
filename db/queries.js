const pool = require('./pool');

async function getAllGames() {
  const { rows } = await pool.query('SELECT * FROM games ORDER BY name');
  return rows;
}

async function getAllDevelopers() {
  const { rows } = await pool.query('SELECT * FROM developers ORDER BY name');
  return rows;
}

async function getAllGenres() {
  const { rows } = await pool.query('SELECT * FROM genres ORDER BY name');
  return rows;
}

async function getGame(id) {
  const query = `
    SELECT 
      g.*,
      ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('id', d.id, 'name', d.name)) AS developer_list,
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

async function getRandomHighlights() {
  const query = `
    WITH rg AS (
      SELECT * FROM games ORDER BY RANDOM() LIMIT 1
    ),
    rd AS (
      SELECT * FROM developers ORDER BY RANDOM() LIMIT 1
    ),
    rgen AS (
      SELECT * FROM genres ORDER BY RANDOM() LIMIT 1 
    )
    SELECT
      rg.id AS g_id,
      rg.name AS g_name,
      rg.image AS g_img,
      rg.background AS g_bgd,
      rg.description AS g_desc,
      rd.id AS d_id,
      rd.name AS d_name,
      rgen.id AS gen_id,
      rgen.name AS gen_name
    FROM rg, rd, rgen;
  `;
  try {
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (error) {
    console.error('Query failed', error);
  }
}

async function getAllGamesByDev(id) {
  const query = `
    SELECT g.*
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

async function getAllGamesNotByDev(id) {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM games
      WHERE id NOT IN (
        SELECT game_id FROM game_developers WHERE developer_id = $1
      );  
    `, [id]);
    return rows;
  } catch (error) {
    console.error('Query failed', error);
  }
}

async function getDevName(id) {
  const { rows } = await pool.query('SELECT name FROM developers WHERE id = $1', [id]);
  return rows[0]?.name;
}

async function getAllGamesInGenre(id) {
  const query = `
    SELECT g.*
    FROM games g
    JOIN game_genres gg ON g.id = gg.game_id
    WHERE gg.genre_id = $1
    ORDER BY g.release_date DESC;
  `;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows;
  } catch (error) {
    console.error('Query failed', error);
  }
}

async function getAllGamesNotInGenre(id) {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM games
      WHERE id NOT IN (
        SELECT game_id FROM game_genres WHERE genre_id = $1
      );  
    `, [id]);
    return rows;
  } catch (error) {
    console.error('Query failed', error);
  }
}

async function getGenreName(id) {
  const { rows } = await pool.query('SELECT name FROM genres WHERE id = $1', [id]);
  return rows[0]?.name;
}

async function addGame(steamId) {
  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}&l=english`);
  const result = await response.json();

  if (!result[steamId] || !result[steamId].success) {
    throw new Error(`Game with Steam ID ${steamId} not found.`);
  }

  const data = result[steamId].data;

  const cleanText = (text) => {
    if (!text) return null;
    return text
      .replace(/<[^>]*>?/gm, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s\s+/g, ' ')
      .trim();
  }

  const parsedDate = new Date(data.release_date?.date);
  const finalDate = isNaN(parsedDate) ? null : parsedDate.toISOString().split('T')[0];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const gameRes = await client.query(
      `INSERT INTO games (steam_id, name, description, release_date, rating, image, background)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (steam_id) DO UPDATE SET 
         name = EXCLUDED.name, 
         description = EXCLUDED.description, 
         rating = EXCLUDED.rating
       RETURNING id`,
      [
        data.steam_appid,
        data.name,
        cleanText(data.short_description || data.about_the_game || ''),
        finalDate,
        data.metacritic ? data.metacritic.score : null,
        data.header_image,
        data.background
      ]
    );
    const gameId = gameRes.rows[0].id;

    if (data.developers) {
      for (const devName of data.developers) {
        const devRes = await client.query(
          `INSERT INTO developers (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
           RETURNING id`, [devName]
        );
        await client.query(
          `INSERT INTO game_developers (game_id, developer_id) 
           VALUES ($1, $2) ON CONFLICT DO NOTHING`, [gameId, devRes.rows[0].id]
        );
      }
    }

    if (data.genres) {
      for (const genre of data.genres) {
        const genRes = await client.query(
          `INSERT INTO genres (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
           RETURNING id`, [genre.description]
        );
        await client.query(
          `INSERT INTO game_genres (game_id, genre_id) 
           VALUES ($1, $2) ON CONFLICT DO NOTHING`, [gameId, genRes.rows[0].id]
        );
      }
    }

    await client.query('COMMIT');
    return gameId;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}


async function addDeveloper(name) {
  try {
    const { rows } = await pool.query(`
      INSERT INTO developers (name)
      VALUES ($1)
      RETURNING id, name;
    `, [name]);
    return rows[0];
  } catch (error) {
    console.error('Error adding developer:', error);
  }
}

async function addGenre(name) {
  try {
    const { rows } = await pool.query(`
      INSERT INTO genres (name)
      VALUES ($1)
      RETURNING id, name;
    `, [name]);
    return rows[0];
  } catch (error) {
    console.error('Error adding genre:', error);
  }
}

async function updateGame(
  id, name, description, release_date, rating,
  developerIds, allDeveloperIds,
  genreIds, allGenreIds,
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      UPDATE games
      SET name = $1, description = $2, release_date = $3, rating = $4
      WHERE id = $5
    `, [name, description, release_date, rating, id]);

    if (genreIds && genreIds.length > 0) {
      await client. query(`
        DELETE FROM game_genres
        WHERE game_id = $1 AND genre_id = ANY($2::int[])
      `, [id, genreIds]);
    }

    if (allGenreIds && allGenreIds.length > 0) {
      await client.query(`
        INSERT INTO game_genres (game_id, genre_id)
        SELECT $1, unnest($2::int[])
        ON CONFLICT (game_id, genre_id) DO NOTHING
      `, [id, allGenreIds]);
    }

    if (developerIds && developerIds.length > 0) {
      await client.query(`
        DELETE FROM game_developers
        WHERE game_id = $1 AND developer_id = ANY($2::int[])
      `, [id, developerIds]);
    }

    if (allDeveloperIds && allDeveloperIds.length > 0) {
      await client.query(`
        INSERT INTO game_developers (game_id, developer_id)
        SELECT $1, unnest($2::int[])
        ON CONFLICT (game_id, developer_id) DO NOTHING
      `, [id, allDeveloperIds]);
    }

    await client.query('COMMIT');
  } catch (error) {
    console.error('Error editing game:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateDeveloper(id, name, gameIds, allGameIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await pool.query(
      'UPDATE developers SET name = $1 WHERE id = $2',
      [name, id]
    );

    if (gameIds && gameIds.length > 0) {
      await client.query(`
        DELETE FROM game_developers
        WHERE developer_id = $1
        AND game_id = ANY($2)
      `, [id, gameIds]);
    }

    if (allGameIds && allGameIds.length > 0) {
      await client.query(`
        INSERT INTO game_developers (game_id, developer_id)
        SELECT unnest($1::int[]), $2
        ON CONFLICT (game_id, developer_id) DO NOTHING;  
      `, [allGameIds, id]);
    }

    await client.query('COMMIT');
  } catch (error) {
    console.error('Error editing developer:', error);
    throw(error);
  } finally {
    client.release();
  }
}

async function updateGenre(id, name, gameIds, allGameIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE genres SET name = $1 WHERE id = $2',
      [name, id]
    );

    if (gameIds && gameIds.length > 0) {
      await client.query(`
        DELETE FROM game_genres
        WHERE genre_id = $1
        AND game_id = ANY($2)
      `, [id, gameIds]);
    }

    if (allGameIds && allGameIds.length > 0) {
      await client.query(`
        INSERT INTO game_genres (game_id, genre_id)
        SELECT unnest($1::int[]), $2
        ON CONFLICT (game_id, genre_id) DO NOTHING;
      `, [allGameIds, id]);
    }

    await client.query('COMMIT');
  } catch (error) {
    console.error('Error editing genre:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function deleteGame(id) {
  try {
    const { rows } = await pool.query(`
      DELETE FROM games
      WHERE id = $1
      RETURNING id, name;  
    `, [id]);
    return rows[0];
  } catch (error) {
    console.error('Error during deletion:', error);
  }
}

async function deleteDeveloper(id) {
  try {
    const { rows } = await pool.query(`
      DELETE FROM developers
      WHERE id = $1
      RETURNING id, name;  
    `, [id]);
    return rows[0];
  } catch (error) {
    console.error('Error during deletion:', error);
  }
}

async function deleteGenre(id) {
  try {
    const { rows } = await pool.query(`
      DELETE FROM genres
      WHERE id = $1
      RETURNING id, name;  
    `, [id]);
    return rows[0];
  } catch (error) {
    console.error('Error during deletion:', error);
  }
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
  getRandomHighlights,
  getAllGamesByDev,
  getAllGamesNotByDev,
  getDevName,
  getAllGamesInGenre,
  getAllGamesNotInGenre,
  getGenreName,
  addGame,
  addDeveloper,
  addGenre,
  updateGame,
  updateDeveloper,
  updateGenre,
  deleteGame,
  deleteDeveloper,
  deleteGenre,
  searchGame,
}