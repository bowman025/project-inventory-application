const db = require('../db/queries');
const CustomValidationError = require('../errors/CustomValidationError');

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
    devId: devId,
  });
}

async function developerAddPost(req, res) {
  try {
    const { developer } = req.body;
    await db.addDeveloper(developer);
    res.redirect('/developers');
  } catch (error) {
    console.error(error);
  }
}

async function developerEditPost(req, res, next) {
  try {
    const { id } = req.params;
    const { name, password } = req.body;
    const gameIds = [req.body.gameIds].flat().filter(Boolean);
    console.log(gameIds);
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.updateDeveloper(id, name);
    if (gameIds.length > 0) await db.removeGamesFromDev(id, gameIds);
    res.redirect(`/developers/${id}`);
  } catch (error) {
    console.error(error);
  }
}

async function developerDeletePost(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return res.status(401).send('Invalid password. Deletion aborted.');
    }
    await db.deleteDeveloper(id);
    res.redirect('/developers');
  } catch (error) {
    console.error(error);
  }
}

module.exports = { 
  developersGet, 
  gamesByDevGet,
  developerAddPost,
  developerEditPost,
  developerDeletePost, 
};