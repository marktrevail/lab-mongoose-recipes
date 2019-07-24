// --------------------------------------------------------------------------------
// Get environment settings 
// --------------------------------------------------------------------------------

require('dotenv').config();

// --------------------------------------------------------------------------------
// Get dependencies
// --------------------------------------------------------------------------------

const express      = require('express');
const mongoose     = require('mongoose');
const bodyParser   = require('body-parser');
const hbs          = require('hbs');
const hbsutils     = require('hbs-utils')(hbs);
const path         = require('path');
const cookieParser = require('cookie-parser');

// --------------------------------------------------------------------------------
// Connect to database
// --------------------------------------------------------------------------------

mongoose.connect('mongodb://localhost/kitchen', { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to Mongo!');
  }).catch(err => {
    console.error('Error connecting to mongo', err);
  });

// --------------------------------------------------------------------------------
  // Create the app
// --------------------------------------------------------------------------------

  const app = express();

// --------------------------------------------------------------------------------
// Define views and static folder
// --------------------------------------------------------------------------------

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbsutils.registerWatchedPartials(__dirname + '/views/partials');  // Register uncompiled partials with hbs for nodemon to track
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------------------------------------
// Configure express session
// --------------------------------------------------------------------------------

const session = require('express-session');

app.use(session({
  secret: 'secret for recipes login',
  resave: false,
  saveUninitialized: true,
}));

// --------------------------------------------------------------------------------
// Add other middleware
// --------------------------------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Attach session data to res.locals to make it available to all views (called after this)
app.use((req,res,next) => {
  if(req.session.user) {res.locals.user = req.session.user;}
  next();
});

// --------------------------------------------------------------------------------
// Set up routing
// --------------------------------------------------------------------------------

// Define route protection --------------------------------------
function protectRoute(req, res, next) {
  if(req.session.user) { return next() };
  res.redirect('/user/login');
}

// Index and error --------------------------------------
app.use('/', require('./routes/index'));
app.use('/', require('./routes/error'));

// User --------------------------------------
app.use('/', require('./routes/user/signup'));
app.use('/', require('./routes/user/login'));
app.use('/', require('./routes/user/logout'));
app.use('/', protectRoute, require('./routes/user/account'));

// Recipe --------------------------------------
app.use('/', protectRoute, require('./routes/recipe/list'));
app.use('/', protectRoute, require('./routes/recipe/detail'));
app.use('/', protectRoute, require('./routes/recipe/remove'));
app.use('/', protectRoute, require('./routes/recipe/edit'));
app.use('/', protectRoute, require('./routes/recipe/create'));

// Cook --------------------------------------
app.use('/', protectRoute, require('./routes/cook/list'));
app.use('/', protectRoute, require('./routes/cook/edit'));
app.use('/', protectRoute, require('./routes/cook/create'));
app.use('/', protectRoute, require('./routes/cook/remove'));

// --------------------------------------------------------------------------------
// Export (needed in bin/www)
// --------------------------------------------------------------------------------

module.exports = app;
