var express = require('express');
var router = express.Router();

module.exports = function (passport) {

  router.get('/', passport.authenticate('oauth2'));

  router.get('/callback',
    passport.authenticate('oauth2', {failureRedirect: '/login'}),
    function (req, res) {
      console.log(req);
      res.redirect('/');
    }
  );

  return router;
};