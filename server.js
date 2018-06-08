var express = require('express');
var exphbs = require('express-handlebars');
var hbs = exphbs.create({
  defaultLayout: 'default',
  helpers: require('./helpers/handlebars').helpers,
  extname: 'handlebars'
});

const userData = require('./userData');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('public'));

/**
 * Make routes for whatever we make in the <nav> section (aka, the .navlinks)
 * The list of links is not final yet, as we need to all agree what's on the list.
 *
 * These below are just my proposal and are subject to change.
 */

// "Home" page is the default page every user ends up on.
// It should display only the goal for the day and the user's progress on that day.
app.get('/', function(req, res, next) {
  res.status(200).render('home', userData['username']);
});

// "About" page talks about us and the project itself. It's a tutorial for new
// users how to use the web app.
app.get('/about', function(req, res, next) {
  res.status(200).render('about');
});

// "Calendar" page will show a calendar where the user's workout plans are displayed
app.get('/calendar', function(req, res, next) {
  res.status(200).render('calendar');
});

// "Stats" page will display the user's statistics over the entire course.
app.get('/stats', function(req, res, next) {
  res.status(200).render('stats');
});

// "Leaderboard" page. I'm not sure about this. I just want to find something to
// integrate the database and multi-account into the web app. IMO, this is
// expected to change.
app.get('/leaderboard', function(req, res, next) {
  res.status(200).render('leaderboard');
});

app.get('*', function(req, res) {
  res.status(404).render('404');
});

app.listen(port, function() {
  console.log('=== Server is listening on port', port);
});
