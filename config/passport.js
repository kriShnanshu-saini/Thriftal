const LocalStrategy = require('passport-local').Strategy;
var mongoose=require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const userdetails = require('../models/userdetails');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      userdetails.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done)  {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    userdetails.findById(id)
      .then(user => {done(null, user)})
      .catch(err => console.log(err));
  });
};