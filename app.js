/*****************************************************************************************
** Name: Joseph A Pfohl
** Date: 
** Assignment: 
** Description: 
*****************************************************************************************/

// require express, express-handlebars and body-parser
var express = require('express');
var handlebars = require('express-handlebars').create( {defaultLayout:'main'} );
var bodyParser = require('body-parser');
var mysql = require('./dbConnect.js');

// create app var
var app = express();

// set up app to use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up static files directory
app.use(express.static('public'));

// enable cross origin requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// set up handlebars and the app's listen port
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 56565);

// GET route
app.get('/',function(req,res){
    res.render('app');
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.reset = "Table reset";
      res.render('app', context);
    })
  });
});

app.get('/render-table', function(req, res, next){

  res.type('application/json');
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if (err) {
      res.send(JSON.stringify({"error": err}));
    } else {
      res.send(JSON.stringify(rows));
    }
  });

});

app.post('/add-exercise', function(req, res, next) {
  
  var reqVals = [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.unit];
  var addString = 'INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`)'
                + 'VALUES (?, ?, ?, ?, ?)';
  var results = {};
  
  res.type('application/json');

  mysql.pool.query(addString, reqVals, function(err, result) {

    if (err) {

      results["err"] = err;
      res.send(JSON.stringify(results));

    } else {

      results['id'] = result.insertId;
      res.send(JSON.stringify(results));

    }
  });

});

app.post('/delete-exercise', function(req, res, next) {

  var deleteString = 'DELETE FROM workouts WHERE id = (?)';

  res.type('application/json');

  mysql.pool.query(deleteString, [req.body.id], function(err, result){
    if(err) {
      res.send(JSON.stringify({"error": "true"}));
    } else {
      res.send(JSON.stringify({"error": "false"}));
    }
  });
  
});

app.post('/update-exercise', function(req, res, next) {

  var selectString = "SELECT * FROM workouts WHERE id=?";
  var updateString = "UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?";
  res.type('application/json');

  mysql.pool.query(selectString, [req.body.id], function(err, result) {

    if (err) {
      // handle error
    } else if (result.length == 1) {

      var currentVals = result[0];
      var queryArr = [req.body.name || currentVals.name, req.body.reps || currentVals.reps,
      req.body.weight || currentVals.weight, req.body.date || currentVals.date, req.body.lbs || currentVals.lbs,
      req.body.id];

      mysql.pool.query(updateString, queryArr, function(err, results) {

        if (err) {
          // handle error
        } else {

          res.send(JSON.stringify(
            {
              "name": queryArr[0],
              "reps": queryArr[1],
              "weight": queryArr[2],
              "date": queryArr[3],
              "lbs": queryArr[4],
              "id": queryArr[5]
            }
          ));

        }

      });

    }

  });

});


// 404 route
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

// internal server error route
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

// set the app to listen
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
