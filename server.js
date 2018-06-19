var express = require('express');
var exphbs = require('express-handlebars');
var hbs = require('./helpers/handlebars')(exphbs);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
var mongoURL;

// fall back to localhost if no username or password. Otherwise, use env var
if (mongoUser === undefined || mongoPassword === undefined) {
  mongoURL = 'mongodb://127.0.0.1' + ':' + mongoPort + '/' + mongoDBName;
} else {
  mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword + '@'
             + mongoHost + ':' + mongoPort + '/' + mongoDBName;
}

var mongoDB = null;
var allUsers = null;
var currentUser = null;
var count = 0;

var app = express();
const port = process.env.PORT || 3000;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(express.static('public'));

/*******************************************************************************
 * GET requests
 ******************************************************************************/

// "Home" page is the default page every user ends up on. It should display only
// the goal for the day and the user's progress on that day.
app.get('/', function(req, res) {
  res.status(200).render('home', {
    userList: allUsers,
    user: currentUser,
    hasSidebar: true,
    activities: currentUser.activities,
    goals: currentUser.goals
  });
});

// "About" page talks about us and the project itself. It's a tutorial for new
// users how to use the web app.
app.get('/about', function(req, res) {
  res.status(200).render('about', {
    user: currentUser
  });
});

// "Calendar" page will show a calendar where the user's workout plans are
// displayed.
app.get('/calendar', function(req, res) {
  res.status(200).render('calendar', {
    user: currentUser,
    days: currentUser.days
  });
});

// "Leaderboard" page to integrate the database and multi-account into the web
// app.
app.get('/leaderboard', function(req, res) {
  // get the current user's total goal and total progress
  mongoDB.collection('users').aggregate(
    { $match: { name: currentUser.name }},
    { $unwind: '$goals' },
    { $group: {
      _id: null,
      goal: { $sum: '$goals.goal' },
      progress: { $sum: '$goals.progress' }
    }},
    { $project: { _id: 0 }})
  .toArray(function(err, result) {
    if (err) {
      res.status(500).send('500: Error calculating total progress');
      return;
    }

    var total = result[0];

    // update the "totalProgress" field of current user
    mongoDB.collection('users').updateOne(
      { name: currentUser.name,
        'totalProgress.description': 'Total Progress'
      },
      { $set: {
        'totalProgress.$.goal': total.goal,
        'totalProgress.$.progress': total.progress,
        'totalProgress.$.percentage': percentageOf(total.goal, total.progress)
      }},
      function(err) {
        if (err) {
          res.status(500).send('500: Error updating total progress');
          return;
        }

        // update users and render the Leaderboard page
        updateUsers();
        res.status(200).render('leaderboard', { userList: allUsers });
      }
    );
  });
});

/*******************************************************************************
 * POST requests
 ******************************************************************************/

/*
 * Incrementally log activity to DB.
 */
app.post('/activity/log', function(req, res) {
  if (req.body && req.body.description && req.body.progress
      && !isNaN(req.body.progress) && !isNaN(req.body.percentage)
      && req.body.activity.content && !isNaN(req.body.activity.percent)) {
    // update goal progress and percentage
    mongoDB.collection('users').updateOne(
      { name: currentUser.name, 'goals.description': req.body.description },
      { $set: {
        'goals.$.progress': req.body.progress,
        'goals.$.percentage': req.body.percentage
      }},
      function(err, result) {
        if (err) {
          res.status(500).send('500: Error updating goal');
          return;
        }

        // update the activity feed
        mongoDB.collection('users').updateOne(
          { name: currentUser.name },
          { $addToSet: {
            "activities": {
              content: req.body.activity.content,
              percent: req.body.activity.percent
            }
          }},
          function(err, result) {
            if (err) {
              res.status(500).send('500: Error updating activity feed');
              return;
            }

            // update the current user's data and send response
            updateUsers();
            res.status(200).send('Activity logged successfully');
          }
        );
      }
    );
  } else {
    res.status(400).send('400: Bad activity log request');
  }
});

/*
 * Add a new goal to DB.
 */
app.post('/goal/add', function(req, res) {
  if (req.body && req.body.description && req.body.goal
     && req.body.progress !== undefined && req.body.percentage !== undefined) {
    // add a new goal to the set
    mongoDB.collection('users').updateOne(
      { name: currentUser.name },
      { $addToSet: {
        'goals': {
          'description': req.body.description,
          'goal': req.body.goal,
          'progress': req.body.progress,
          'percentage': req.body.percentage
        }
      }},
      function(err) {
        if (err) {
          res.status(500).send('500: Error adding new goal');
          return;
        }

        // update the current user's data and send response
        updateUsers();
        res.status(200).send('New goal added successfully');
      }
    );
  } else {
    res.status(400).send('400: Bad goal addition request');
  }
});

/*
 * Remove an exisiting goal from DB.
 */
app.post('/goal/remove', function(req, res) {
  if (req.body && req.body.description !== '') {
    // remove the goal from the set
    mongoDB.collection('users').updateOne(
      { name: currentUser.name },
      { $pull: {
        goals: { 'description': req.body.description }
      }},
      function(err) {
        if (err) {
          res.status(500).send('500: Error removing the selected goal');
          return;
        }

        // update the current user's data and send response
        updateUsers();
        res.status(200).send('Selected goal removed successfully');
      }
    );
  } else {
    res.status(400).send('400: Bad goal removal request');
  }
});

/*
 * Update the weekly plan.
 */
app.post('/calendar/update', function(req, res) {
  if (req.body && req.body.weekday && req.body.content) {
    // update the day's plan
    mongoDB.collection('users').updateOne(
      { name: currentUser.name, "days.weekday": req.body.weekday },
      { $set: { "days.$.content" : req.body.content }},
      function(err) {
        if (err) {
          res.status(500).send('500: Error updating calendar');
          return;
        }

        // update the current user's data and send response
        updateUsers();
        res.status(200).send('Calendar updated successfully');
      }
    );
  } else {
    res.status(400).send('400: Bad calendar update request');
  }
});

/*
 * Add a new user to DB.
 */
app.post('/user/add', function(req, res){
  if(req.body && req.body.name && req.body.profilePicUrl){
    // add a new user to the DB
    mongoDB.collection('users').insertOne(req.body, function(err) {
      if (err) {
        res.status(500).send('500: Error adding new user');
        return;
      }

      // update user, send response, and go to the new user's page
      changeUser(req.body.name);
      res.status(200).send('New user added successfully');
      next();
    });
  }
  else{
    res.status(400).send('400: Bad user addition request');
  }
});

/*
 * Change user session.
 */
app.post('/user/change', function(req, res){
  if(req.body && req.body.name){
    changeUser(req.body.name);
    res.status(200).send('User changed successfully');
  }
  else{
    res.status(400).send('400: Bad user change request');
  }
});

/*******************************************************************************
 * 404 Handler
 ******************************************************************************/

app.get('*', function(req, res) {
  res.status(404).render('404', {
    user: currentUser
  });
});


/*******************************************************************************
 * Helper functions
 ******************************************************************************/

/*
 * Update current user's data to make things more continuous.
 */
function updateUsers() {
  var userCollection = mongoDB.collection('users');
  userCollection.find().toArray(function (err, userTable) {
    if (err) {
      throw err;
    }
    allUsers = userTable;
    currentUser = allUsers[count];
  });
}

/*
 * Switch between user sessions.
 */
function changeUser(userName){
  var userCollection = mongoDB.collection('users');
  userCollection.find().toArray(function (err, userTable) {
    if (err) {
      throw err;
    }
    allUsers = userTable;
    count = 0;
    while(allUsers[count]){
      if(allUsers[count].name == userName){
        currentUser = allUsers[count];
        break;
      }
      else{
        count += 1;
      }
    }
  });

}

/*
 * Get percentage of two numbers
 */
function percentageOf(num1, num2) {
  if (!isNaN(num1) && !isNaN(num2)) {
    // if num2 > num1, return 100. Otherwise, return floor(num2 * 100.0 / num1)
    if (num2 >= num1) {
      return 100;
    } else {
      return Math.floor(num2 * 100.0 / num1);
    }
  } else {
    // if either num1 or num2 is not a number, return 0
    return 0;
  }
}

/*******************************************************************************
 * Connect to MongoDB and start server.
 ******************************************************************************/

MongoClient.connect(mongoURL, function(err, client) {
  if (err) {
    throw err;
  }
  mongoDB = client.db(mongoDBName);

  var userCollection = mongoDB.collection('users');
  userCollection.find().toArray(function (err, userTable) {
    if (err) {
      throw err;
    }
    allUsers = userTable;
    currentUser = allUsers[0];

    console.log('========================================');
    console.log('  gymrats collection:');
    console.log('========================================');
    console.log(JSON.stringify(userTable, null, 2));
  });

  app.listen(port, function() {
    console.log('========================================');
    console.log('  Server is listening on port', port);
    console.log('========================================');
  });
});
