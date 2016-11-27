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

// create app var
var app = express();

// set up app to use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up static files directory
app.use(express.static('public'));

// set up handlebars and the app's listen port
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 56565);

// GET route
app.get('/',function(req,res){
    res.render('app');
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
