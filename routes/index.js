var resource = require('./resource');
var mongoose = require("mongoose");

var passport = require('passport');
var ensure = require('connect-ensure-login');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(function(username, password, done) {
  mongoose.model("users").findByUsernamePassword(username, password, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  mongoose.model("users").findById(id, function(err, user) {
    done(err, user);
  });
});

/*
 * GET home page.
 */
 
function index(req, res){
  res.render('index', { title: 'restapp' });
};

function login(req, res){
  res.render('login', { title: 'restapp' });
};

/**
 * Set up routes
 */
module.exports = function(app, options) {
  app.get('/', index);
  app.get('/login', login);

  app.post('/login', passport.authenticate('local', {
	  successReturnToOrRedirect : '/',
	  failureRedirect : '/login'
  }));

  resource.setup(app, options);
}