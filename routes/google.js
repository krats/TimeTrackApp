var express = require('express');
var router = express.Router();
const passport = require('passport');

module.exports = function (passport) {

  router.get('/', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    accessType: 'offline',
    prompt: 'consent',
    includeGrantedScopes: true,
    authType: 'rerequest'}));

  router.get('/callback',
    passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/'
    }));

  function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
  }

  return router;
}