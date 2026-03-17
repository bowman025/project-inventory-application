const db = require('../db/queries');

async function developersGet(req, res) {
  const developers = await db.getAllDevelopers();
  res.render('developers', {
    title: 'Game Developers',
    developers: developers,
  });
}

async function gamesByDevGet(req, res) {
  const devId = req.params.id;
  const games = await db.getAllGamesByDev(devId);
  res.render('developerGames', {
    title: 'Developer Games',
    games: games,
  });
}

module.exports = { developersGet, gamesByDevGet };