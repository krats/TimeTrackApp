var User            = require('../models/User');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const OAuth2Strategy = require('passport-oauth2');
var configAuth = require('../config/auth');


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        scope: ['https://www.googleapis.com/auth/calendar.readonly'],
        accessType: 'offline',
        prompt: 'consent',
        approvalPrompt: 'force'

    },

    function(accessToken, refreshToken, profile, done) {

        process.nextTick(function() {

            User.findOne({ 'google_id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    user.access_token = accessToken;
                    if(refreshToken)
                      user.refresh_token = refreshToken;
                    user.save(function(err) {
                      if (err)
                        throw err;
                      return done(null, user);
                    });
                } else {
                    var newUser = new User();

                    newUser.google_id    = profile.id;
                    newUser.access_token = accessToken;
                    if(refreshToken)
                      newUser.refresh_token = refreshToken;
                    newUser.name  = profile.displayName;
                    newUser.email = profile.emails[0].value; // pull the first email

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

  passport.use(new OAuth2Strategy({
      authorizationURL: configAuth.harvestAuth.authorizationURL,
      tokenURL: configAuth.harvestAuth.tokenURL,
      clientID: configAuth.harvestAuth.clientID,
      clientSecret: configAuth.harvestAuth.clientSecret,
      callbackURL: configAuth.harvestAuth.callbackURL,
      passReqToCallback : true
    },
    function(req, accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        var scope = req.query.scope;
        var code = req.query.code;
        var harvest_account_id = scope.split(":")[1];
        var harvest_user_id = code.split(".")[0];
        if(!req.user) {

          User.findOne({'harvest_id': profile.id}, function (err, user) {
            if (err)
              return done(err);

            if (user) {
              user.harvest_access_token = accessToken;
              user.harvest_refresh_token = refreshToken;
              user.harvest_user_id = harvest_user_id;
              user.harvest_account_id = harvest_account_id;
              user.save(function(err) {
                if (err)
                  return done(err);
                return done(null, user);
              });
            } else {
              return done(err);
            }
          });
        } else {
          var user = req.user;
          user.harvest_account_id = harvest_account_id;
          user.harvest_user_id = harvest_user_id;
          user.harvest_access_token = accessToken;
          user.harvest_refresh_token = refreshToken;
          user.save(function(err) {
            if (err)
              return done(err);
            return done(null, user);
          });
        }
      });
    }
  ));

};