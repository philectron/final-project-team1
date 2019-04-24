var express = require('express');
var exphbs = require('express-handlebars');
var hbs = require('./helpers/handlebars')(exphbs);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto');
var session = require('client-sessions');

const HASH_ALGO = 'sha256';

const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB = process.env.MONGO_DB || 'gymrats';
const MONGO_COLLECTION = 'users';
var mongoURL = null;
var mongoDB = null;

// Use environment variable or fallback to use localhost
if (MONGO_USER || MONGO_PASSWORD) {
  mongoURL = 'mongodb://' + MONGO_USER + ':' + MONGO_PASSWORD + '@'
             + MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DB;
} else {
  mongoURL = 'mongodb://127.0.0.1' + ':' + MONGO_PORT + '/' + MONGO_DB;
}

var app = express();
const PORT = process.env.PORT || 3000;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

/*******************************************************************************
 * Credits to https://stormpath.com/blog/everything-you-ever-wanted-to-know-about-node-dot-js-sessions
 ******************************************************************************/

// Configures client-sessions.
app.use(session({
  cookieName: 'session',
  secret: 'NirDvGimi9t7UHvdW8y0',  // random string
  duration: 30 * 60 * 1000,  // (in microseconds) 30 minutes
  activeDuration: 5 * 60 * 1000,  // (in microseconds) 5 minutes
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

// Global middleware function to check for session in several GET requests.
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    mongoDB.collection(MONGO_COLLECTION)
      .find({ '_id': req.session.user._id })
      .toArray(function(err, users) {
      if (!err && Array.isArray(users) && users.length === 1) {
        req.user = users[0];
        delete req.user.hash;  // delete password's hash from the session
        req.session.user = users[0];  // refresh the session value
        res.locals.user = users[0];
      }
      next();
    });
  } else {
    next();
  }
});

/*******************************************************************************
 * GET request handlers
 ******************************************************************************/

// "Home" page is the default page every user ends up on. It should display only
// the goal for the day and the user's progress on that day.
app.get('/', requireLogin, function(req, res) {
  res.status(200).render('home', {
    hasSidebar: true,
    loggedIn: true,
    user: req.user
  });
});

// "About" page talks about us and the project itself. It's a tutorial for new
// users how to use the web app.
app.get('/about', requireLogin, function(req, res) {
  res.status(200).render('about', {
    loggedIn: true,
    user: req.user
  });
});

// "Calendar" page shows a calendar where the user's workout plans are
// displayed.
app.get('/calendar', requireLogin, function(req, res) {
  res.status(200).render('calendar', {
    loggedIn: true,
    user: req.user
  });
});

// "Leaderboard" page integrates the database and multi-account into the web
// app.
app.get('/leaderboard', requireLogin, function(req, res) {
  mongoDB.collection(MONGO_COLLECTION).find().toArray(
    function(err, users) {
      if (err || !Array.isArray(users) || !users.length) {
        res.status(500).send('500: Error fetching users from database');
        return;
      }

      res.status(200).render('leaderboard', {
        loggedIn: true,
        user: req.user,
        userList: users
      });
  });
});

app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/login', function(req, res) {
  // if already logged in, redirect to index
  if (req.user) {
    res.redirect('/');
    return;
  }

  // forget the logged in user
  req.session.reset();

  // go to the login front-end
  res.status(200).render('login', {
    formURL: '/user/login',
    submitButtonName: 'Log In'
  });
});

app.get('/register', function(req, res) {
  res.status(200).render('register', {
    formURL: '/user/register',
    submitButtonName: 'Register'
  });
});

/*******************************************************************************
 * 404 handler
 ******************************************************************************/

app.get('*', function(req, res) {
  res.status(404).render('404');
});

/*******************************************************************************
 * POST request handlers
 ******************************************************************************/

// Incrementally logs activity to DB.
app.post('/activity/log', requireLogin, function(req, res) {
  if (req.body && req.body.description && notNegative(req.body.index)
      && isPositive(req.body.progressInc) && req.body.activity.content
      && isPositive(req.body.activity.percent)) {
    // find the selected goal
    mongoDB.collection(MONGO_COLLECTION).aggregate([
      { $match: { _id: req.user._id } },
      {
        $project: {
          _id: 0,
          ithGoal: { $arrayElemAt: ['$goals', req.body.index] },
          totalProgress: '$totalProgress'
        }
      }
    ]).toArray(function(errFind, result) {
      if (errFind) {
        res.status(500).send('500: Error finding the selected goal');
        return;
      }

      var newGoalPercentage = percentageOf(
        result[0].ithGoal.goal,
        result[0].ithGoal.progress + req.body.progressInc
      );

      var newTotalPercentage = percentageOf(
        result[0].totalProgress.goal,
        result[0].totalProgress.progress + req.body.progressInc
      );

      // update goal progress and percentage
      mongoDB.collection(MONGO_COLLECTION).updateOne(
        {
          _id: req.user._id,
          'goals._id': req.body.description.toLowerCase()
        },
        {
          // increase goal progress and total progress
          $inc: {
            'goals.$.progress': req.body.progressInc,
            'totalProgress.progress': req.body.progressInc,
          },
          // set goal percentage and total percentage
          $set: {
            'goals.$.percentage': newGoalPercentage,
            'totalProgress.percentage': newTotalPercentage
          },
          // push the goal progress content to the end of the activity feed
          $addToSet: {
            'activities': {
              content: req.body.activity.content,
              percent: req.body.activity.percent
            }
          }
        },
        function(errUpdate) {
          if (errUpdate) {
            res.status(500).send('500: Error updating goal');
            return;
          }

          res.status(200).send('Activity logged successfully');
      });
    });
  } else {
    res.status(400).send('400: Bad activity log request');
  }
});

// Adds a new goal to DB.
app.post('/goal/add', requireLogin, function(req, res) {
  if (req.body && req.body.description && isPositive(req.body.goal)) {
    mongoDB.collection(MONGO_COLLECTION).updateOne(
      { _id: req.user._id },
      {
        // push this new goal to the end of the goals array
        $addToSet: {
          'goals': {
            '_id': req.body.description.toLowerCase(),
            'description': req.body.description,
            'goal': req.body.goal,
            'progress': 0,
            'percentage': 0
          }
        },
        // increase the total goal in totalProgress
        $inc: { 'totalProgress.goal': req.body.goal }
      },
      function(err) {
        if (err) {
          res.status(500).send('500: Error adding new goal');
          return;
        }

        res.status(200).send('New goal added successfully');
    });
  } else {
    res.status(400).send('400: Bad goal addition request');
  }
});

// Removes an exisiting goal from database.
app.post('/goal/remove', requireLogin, function(req, res) {
  if (req.body && notNegative(req.body.index)) {
    // select the goal with the corresponding index in the goals array
    mongoDB.collection(MONGO_COLLECTION).aggregate([
      { $match: { _id: req.user._id } },
      {
        $project: {
          _id: 0,
          ithGoal: { $arrayElemAt: ['$goals', req.body.index] },
          totalProgress: '$totalProgress'
        }
      },
    ]).toArray(function(errFind, result) {
      if (errFind) {
        res.status(500).send('500: Error finding the selected goal');
        return;
      }

      var goalChange = result[0].ithGoal.goal;
      var progressChange = result[0].ithGoal.progress;
      var description = result[0].ithGoal.description;
      var newTotalPercentage = percentageOf(
        result[0].totalProgress.goal - goalChange,
        result[0].totalProgress.progress - progressChange
      );

      mongoDB.collection(MONGO_COLLECTION).updateOne(
        { _id: req.user._id },
        {
          // decrease total goal and total progress from totalProgress
          $inc: {
            'totalProgress.goal': -goalChange,
            'totalProgress.progress': -progressChange
          },
          // set the new total percentage
          $set: { 'totalProgress.percentage': newTotalPercentage },
          // remove the selected goal from the goals array
          $pull: { goals: { _id: description.toLowerCase() } }
        },
        function(errRemove) {
          if (errRemove) {
            res.status(500).send('500: Error removing selected goal');
            return;
          }

          res.status(200).send('Selected goal removed successfully');
      });
    });
  } else {
    res.status(400).send('400: Bad goal removal request');
  }
});

// Updates the weekly plan.
app.post('/calendar/update', requireLogin, function(req, res) {
  if (req.body && req.body.weekday && req.body.content) {
    // update the day's plan
    mongoDB.collection(MONGO_COLLECTION).updateOne(
      {
        _id: req.user._id,
        "days.weekday": req.body.weekday
      },
      {
        $set: { "days.$.content": req.body.content }
      },
      function(err) {
        if (err) {
          res.status(500).send('500: Error updating calendar');
          return;
        }

        res.status(200).send('Calendar updated successfully');
    });
  } else {
    res.status(400).send('400: Bad calendar update request');
  }
});

app.post('/user/login', function(req, res) {
  if (!req.body) {
    res.status(400).render('400', { error400Message: 'Missing request body' });
  } else if (!req.body.username) {
    res.status(400).render('400', { error400Message: 'Missing username' });
  } else if (!req.body.password) {
    res.status(400).render('400', { error400Message: 'Missing password' });
  } else {
    // try to find the provided username in the database
    mongoDB.collection(MONGO_COLLECTION).find({ '_id': req.body.username })
      .toArray(function(err, users) {
        if (err) {
          res.status(500).send('500: Error fetching users from database');
          return;
        }

        // if the user does not exist and/or password is incorrect
        if (!Array.isArray(users) || users.length !== 1
            || getHash(req.body.password) !== users[0].hash) {
            res.status(400).render('400', {
              error400Message: 'Invalid username and/or password'
            });
        } else {
          // sets a cookie with the user's info
          req.session.user = users[0];
          // redirect to index
          res.redirect('/');
        }
    });
  }
});

app.post('/user/register', function(req, res) {
  if (!req.body) {
    res.status(400).render('400', { error400Message: 'Missing request body' });
  } else if (!req.body.fullName) {
    res.status(400).render('400', { error400Message: 'Missing full name' });
  } else if (!req.body.username) {
    res.status(400).render('400', { error400Message: 'Missing username' });
  } else if (!req.body.password) {
    res.status(400).render('400', { error400Message: 'Missing password' });
  } else if (!req.body.confirmPassword) {
    res.status(400).render('400', {
      error400Message: 'Missing password confirmation'
    });
  } else if (req.body.confirmPassword !== req.body.password) {
    res.status(400).render('400', {
      error400Message: 'Passwords must match'
    });
  } else if (!isAlphaNumeric(req.body.fullName)) {
    res.status(400).render('400', {
      error400Message: 'Full name must be alphanumeric'
    });
  } else {
    // forget the logged in user
    req.session.reset();

    // try to find the provided username in the database
    mongoDB.collection(MONGO_COLLECTION).find({ '_id': req.body.username })
      .toArray(function(errFind, users) {
        if (errFind) {
          res.status(500).send('500: Error fetching users from database');
          return;
        }

        // if the username already exists
        if (Array.isArray(users) && users.length
            && users[0]._id === req.body.username) {
          res.status(400).render('400', {
            error400Message: 'Username already exists'
          });
        } else {
          // register this user
          mongoDB.collection(MONGO_COLLECTION).insertOne(
            {
              '_id': req.body.username,
              'hash': getHash(req.body.password),
              'name': req.body.fullName,
              'profilePicUrl': req.body.profilePicUrl,
              'totalProgress': {
                'goal': 0,
                'progress': 0,
                'percentage': 0
              },
              'goals': [],
              'days': [
                {
                  '_id': 'sunday',
                  'weekday': 'Sunday',
                  'content': ''
                },
                {
                  '_id': 'monday',
                  'weekday': 'Monday',
                  'content': ''
                },
                {
                  '_id': 'tuesday',
                  'weekday': 'Tuesday',
                  'content': ''
                },
                {
                  '_id': 'wednesday',
                  'weekday': 'Wednesday',
                  'content': ''
                },
                {
                  '_id': 'thursday',
                  'weekday': 'Thursday',
                  'content': ''
                },
                {
                  '_id': 'friday',
                  'weekday': 'Friday',
                  'content': ''
                },
                {
                  '_id': 'saturday',
                  'weekday': 'Saturday',
                  'content': ''
                }
              ],
              'activities': []
            },
            function(err) {
              if (err) {
                res.status(500).send('500: Error registering new user');
                return;
              } else {
                // remember this user's session
                req.session.user = req.body;
                // redirect to index
                res.redirect('/');
              }
          });
        }
    });
  }
});

/*******************************************************************************
 * Helper functions
 ******************************************************************************/

// Returns the hash of a string in hex.
function getHash(input) {
  return crypto.createHash(HASH_ALGO).update(input).digest('hex');
}

// Combines with the global middleware of client-sessions to make GET request
// handlers shorter.
function requireLogin(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Returns what the percentage  small  is of  big .
function percentageOf(big, small) {
  if (!isNaN(big) && !isNaN(small) && big !== 0) {
    return Math.round(small * 100.0 / big);
  } else {
    return 0;
  }
}

// Returns true if  x  is a non-negative number. Returns false otherwise.
function notNegative(x) {
  var xFloat = parseFloat(x);
  return !isNaN(xFloat) && xFloat >= 0;
}

// Returns true if  x  is a positive number. Returns false otherwise.
function isPositive(x) {
  var xFloat = parseFloat(x);
  return !isNaN(xFloat) && xFloat > 0;
}

// Returns true if  str  is alphanumeric. Returns false otherwise.
function isAlphaNumeric(str) {
  for (var i = 0, len = str.length; i < len; i++) {
    var code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) &&   // numeric (0-9)
        !(code > 64 && code < 91) &&   // upper alpha (A-Z)
        !(code > 96 && code < 123)) {  // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

/*******************************************************************************
 * Connect to MongoDB and start server
 ******************************************************************************/

MongoClient.connect(mongoURL, function(err, client) {
  if (err) throw err;

  mongoDB = client.db(MONGO_DB);

  app.listen(PORT, function() {
    console.log('========================================');
    console.log('  Server is listening on port', PORT);
    console.log('========================================');
  });
});
