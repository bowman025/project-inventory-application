require('dotenv').config();

const express = require('express');
const app = express();

const indexRouter = require('./routes/indexRouter');
const gamesRouter = require('./routes/gamesRouter');
const developersRouter = require('./routes/developersRouter');
const genresRouter = require('./routes/genresRouter');
const CustomNotFoundError = require('./errors/CustomNotFoundError');

const path = require('node:path');
const assetsPath = path.join(__dirname, 'public');

app.set('views', path.join(__dirname, '/views/pages'));
app.set('view engine', 'ejs');

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/games', gamesRouter);
app.use('/developers', developersRouter);
app.use('/genres', genresRouter);

app.use((req, res, next) => {
  console.log("Unmatched URL:", req.url);
  next(new CustomNotFoundError('Page Not Found.'));
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('error', {
    title: 'The Game Inventory: Error',
    message: err.message,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening...`);
});
