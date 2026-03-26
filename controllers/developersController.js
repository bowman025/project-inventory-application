const { 
  body, 
  validationResult, 
  matchedData, 
} = require('express-validator');
const db = require('../db/queries');
const cleanIds = require('../utils/cleanIds');
const CustomValidationError = require('../errors/CustomValidationError');

const validateDeveloperName = body('developer')
  .trim()
  .isLength({ min: 1, max: 50 }).withMessage('Developer name must be between 1 and 50 characters.')
  .escape();

const validatePassword = body('password')
  .notEmpty().withMessage('Password is required');

async function developersGet(req, res, next) {
  try {
    const developers = await db.getAllDevelopers();
    res.render('developers', {
      title: 'The Game Inventory: Developers',
      developers: developers,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function gamesByDevGet(req, res, next) {
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
    next(error);
  }
}

async function developerAddPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const data = matchedData(req);
    await db.addDeveloper(data.developer);
    res.redirect('/developers');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function developerEditPost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const { id } = req.params;
    const data = matchedData(req);

    if (data.password !== process.env.ADMIN_PASS) {
      return next(new CustomValidationError('Invalid password. Edit aborted.'));
    }

    const gameIds = cleanIds(req.body.gameIds);
    const allGameIds = cleanIds(req.body.allGameIds);
    
    await db.updateDeveloper(id, data.developer, gameIds, allGameIds);
    res.redirect(`/developers/${id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function developerDeletePost(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new CustomValidationError(errors.array()[0].msg));
  }

  try {
    const { id } = req.params;
    const data = matchedData(req);

    if (data.password !== process.env.ADMIN_PASS) {
      return next(new CustomValidationError('Invalid password. Deletion aborted.'));
    }

    await db.deleteDeveloper(id);
    res.redirect('/developers');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = { 
  developersGet, 
  gamesByDevGet,
  developerAddPost: [validateDeveloperName, developerAddPost],
  developerEditPost: [validateDeveloperName, validatePassword, developerEditPost],
  developerDeletePost: [validatePassword, developerDeletePost], 
};