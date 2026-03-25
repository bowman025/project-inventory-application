const db = require('../db/queries');
const cleanIds = require('../utils/cleanIds');
const CustomValidationError = require('../errors/CustomValidationError');

async function developersGet(req, res) {
  try {
    const developers = await db.getAllDevelopers();
    res.render('developers', {
      title: 'The Game Inventory: Developers',
      developers: developers,
    });
  } catch (error) {
    console.error(error);
  }
}

async function gamesByDevGet(req, res) {
  try {
    const devId = req.params.id;
    const devName = await db.getDevName(devId);
    const games = await db.getAllGamesByDev(devId);
    const allGames = await db.getAllGamesNotByDev(devId);
    res.render('developerDetail', {
      title: `The Game Inventory: ${devName}`,
      games: games,
      allGames: allGames,
      devName: devName,
      devId: devId,
    });
  } catch (error) {
    console.error(error);
  }
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
    const gameIds = cleanIds(req.body.gameIds);
    const allGameIds = cleanIds(req.body.allGameIds);
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }
    await db.updateDeveloper(id, name, gameIds, allGameIds);
    res.redirect(`/developers/${id}`);
  } catch (error) {
    console.error(error);
  }
}

async function developerDeletePost(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const isValid = password === process.env.ADMIN_PASS;
    if (!isValid) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
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