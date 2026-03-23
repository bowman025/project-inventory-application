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

async function developerDeletePost(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  const isValid = password === process.env.ADMIN_PASS;

  if (!isValid) {
    return res.status(401).send('Invalid password. Deletion aborted.');
  }

  await db.deleteDeveloper(id);
  res.redirect('/developers');
}

module.exports = { 
  developersGet, 
  gamesByDevGet,
  developerDeletePost, 
};