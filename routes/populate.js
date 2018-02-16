var express = require('express');
var router = express.Router();
var google = require('googleapis').google;
var googleAuth = require('google-auth-library');
var configAuth = require('../config/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user && req.user.harvest_access_token) {
      var calendar = google.calendar('v3');
      var auth = new googleAuth();
      var oauth2Client = new auth.OAuth2(configAuth.googleAuth.clientID, configAuth.googleAuth.clientSecret,configAuth.googleAuth.callbackURL);
      oauth2Client.credentials = {
        access_token: req.user.access_token,
        refresh_token: req.user.refresh_token,
        token_type: 'Bearer'
      };
      calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var events = response.items;
        if (events.length == 0) {
          console.log('No upcoming events found.');
        } else {
          console.log('Upcoming 10 events:');
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            console.log('%s - %s', start, event.summary);
          }
        }
      });
    } else {
      res.render('harvest');
    }
  } else {
    res.render('index', {title: 'Express'});
  }
});

module.exports = router;