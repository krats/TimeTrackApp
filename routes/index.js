var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
        if (req.user && req.user.harvest_access_token) {
          res.render('populate');
        } else {
          res.render('harvest');
        }
  } else {
    res.render('index', {title: 'Express'});
  }
});

module.exports = router;
