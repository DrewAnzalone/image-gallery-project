const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const Image = require('./models/image.js');
const passUserToView = require("./middleware/pass-user-to-view.js")
const authController = require('./controllers/auth.js');
const userController = require('./controllers/user.js');

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Turns a csv-like string into a complex mongoose query for finding documents
// If the string is falsy or only contains falsy elements (i.e. "  , ") then the returned query is {}
function processToQuery(req) {
  const tags = req.query?.tags ?? '';
  const processedSearchTerms = tags.split(",").map(tag => tag.trim().toLowerCase()).filter(e => e);

  const query = processedSearchTerms.length ?
    { // This query was written with the help of AI
      $and: processedSearchTerms.map(val => ({
        $or: [
          { title: { $regex: val, $options: 'i' } },
          { notes: { $regex: val, $options: 'i' } },
          { artist: { $regex: val, $options: 'i' } },
          { tags: { $in: [val] } }
        ]
      }))
    } :
    {};

  return query;
}

app.get('/', async (req, res) => {
  res.render('home.ejs', {
    user: req.session.user
  });
});

app.get('/index/search', async (req, res) => {
  const query = processToQuery(req);

  const images = await Image.find(query);
  res.render("index.ejs", { user: req.session.user, images: images.toReversed() });
});

app.use(passUserToView);
app.use('/auth', authController);
app.use('/users', userController);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});

