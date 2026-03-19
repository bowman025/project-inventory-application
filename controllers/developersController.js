const db = require('../db/queries');

async function developersGet(req, res) {
  const developers = await db.getAllDevelopers();
  res.render('developers', {
    title: 'The Game Inventory: Developers',
    developers: developers,
  });
}

async function gamesByDevGet(req, res) {
  const devId = req.params.id;
  const games = await db.getAllGamesByDev(devId);
  const devName = await db.getDevName(devId);
  res.render('developerDetail', {
    title: `The Game Inventory: ${devName}`,
    games: games,
    devName: devName,
  });
}

module.exports = { developersGet, gamesByDevGet };