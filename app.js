/**
 * Main application
 */

var express = require('express')
  , passport = require('passport')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// Expose the app to our test runner
module.exports = app;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var options = {};

var mongo = require('./db/mongo-store');
mongo(options);
options.mongoose = mongo.mongoose;
require('./models/user')(options);
require('./models/blog')(options);

routes(app, options);

http.createServer(app).listen(app.get('port'), function(){
  console.log("restapp listening on port " + app.get('port'));
});

