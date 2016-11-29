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

app.post('/add-exercise', function(req, res, next) {
  var reqContent = JSON.parse(req.query);
  console.log(reqContent);
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
