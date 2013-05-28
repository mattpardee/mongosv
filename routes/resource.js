var passport = require('passport')
  , ensure = require('connect-ensure-login')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../models/user');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(function(username, password, done) {
  User.findByUsernamePassword(username, password, function(err, user) {
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
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


/**
 * REST APIs for mongoose models that supports CRUD operations 
 */

/**
 * Create a new entity
 */
exports.create = function(mongoose) {
  var mongo = mongoose;
  return function(req, res, next) {
    var mongoModel = mongo.model(req.params.resource);
    if(!mongoModel) {
      next();
      return;
    }
    mongoModel.create(req.body, function (err, obj) {
      if (err) {
        console.log(err);
        res.send(500, err);
      }
      else {
        res.send(200, obj);
      }
    });
  };
}

/**
 * List all entities 
 */
exports.list = function(mongoose) {
  var mongo = mongoose;
  return function(req, res, next) {
    var mongoModel = null; 
    try {
      mongoModel = mongo.model(req.params.resource);
    } catch(err) {
      console.log(err);
    } 
    if(!mongoModel) {
      next();
      return;
    } 
    var options = {};
    if(req.query.skip) {
      options.skip = req.query.skip;
    }
    if(req.query.limit) {
      options.limit = req.query.limit;
    }
    mongoModel.find(null, null, options, function (err, objs) {
      if (err) {
        console.log(err);
        res.send(500, err);
      } else {
        res.send(200, objs);
      }
    });
  }; 
}

/**
 * Find an entity by id
 */
exports.findById = function(mongoose) {
  var mongo = mongoose;
  return function(req, res, next) {
    var mongoModel = mongo.model(req.params.resource);
    if(!mongoModel) {
      next();
      return;
    }
    var id = req.params.id;
    mongoModel.findById(id, function (err, obj) {
      if (err) {
        console.log(err);
        res.send(404, err);
      }
      else {
        res.send(200, obj);
      }
    });
  };
}

/**
 * Delete an entity by id
 */
exports.deleteById = function(mongoose) {
  var mongo = mongoose;
  return function(req, res, next) {
    var mongoModel = mongo.model(req.params.resource);
    if(!mongoModel) {
      next();
      return;
    }
    var id = req.params.id;
    mongoModel.findByIdAndRemove(id, function (err, obj) {
      if (err) {
        console.log(err);
        res.send(404, err);
      }
      else {
        res.send(200, obj);
      }
    });
  };
}

/**
 * Update an entity by id
 */
exports.updateById = function(mongoose) {
  var mongo = mongoose;
  return function(req, res, next) {
    var mongoModel = mongo.model(req.params.resource);
    if(!mongoModel) {
      next();
      return;
    }
    var id = req.params.id;
    mongoModel.findByIdAndUpdate(id, req.body, function (err, obj) {
      if (err) {
        console.log(err);
        res.send(404, err);
      }
      else {
        res.send(200, obj);
      }
    });
  };
}

/**
 * Expose the CRUD operations as REST APIs
 */
exports.setup = function(app, options) {
  options = options || {};
  mongoose = options.mongoose || require('../db/mongo-store').mongoose;
  
  var base = options.path || '/rest';
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Create a new entity
  app.post(base + '/:resource', exports.create(mongoose));

  // List the entities
  app.get(base + '/:resource', exports.list(mongoose));

  // Find the entity by id
  app.get(base + '/:resource/:id', exports.findById(mongoose));

  // Update the entity by id
  app.put(base + '/:resource/:id', exports.updateById(mongoose));

  // Delete the entity by id
  app.delete(base + '/:resource/:id', exports.deleteById(mongoose));
}
