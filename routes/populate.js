var express = require('express');
var router = express.Router();
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var configAuth = require('../config/auth');

var foo = require('./harvest.json');

/* GET home page. */

function getMonday(d) {
  d = new Date(d);
  let day = d.getDay(),
  diff = d.getDate() - day + (day == 0 ? -6:1);
  let date_monday = new Date(d.setDate(diff));
  date_monday.setHours(0,0,0,0);
  return date_monday.toISOString();
}

function getTimeSheetDetailsForHarvest(events) {

  let harvest_details = [];
  let project_assignments = foo.project_assignments;
  for (event of events) {
    let summary = event.summary;
    var event_details = summary.match(/^\[([ A-Za-z0-9_@./#&+-]+)\]:\[([ A-Za-z0-9_@./#&+-]+)\]:([ A-Za-z0-9_@./#&+-]+)/);
    var harvest_event = {};

    var start_time = new Date(event.start.dateTime ? event.start.dateTime : event.start.date);
    var end_time = new Date(event.end.dateTime ? event.end.dateTime : event.end.date);

    var event_duration = (end_time.getTime() - start_time.getTime())/(1000*60*60);

    harvest_event.duration = event_duration;
    if(event_details != null) {
        harvest_event.client = event_details[1];
        harvest_event.project = event_details[2];
        harvest_event.event_summary = event_details[3];
        for(i in project_assignments) {
          if(harvest_event.project.toLowerCase() == project_assignments[i].project.name.toLowerCase() 
            && harvest_event.client.toLowerCase() == project_assignments[i].client.name.toLowerCase()) {
              harvest_event.project_id = project_assignments[i].project.id;
              harvest_event.client_id = project_assignments[i].client.id;
              harvest_event.task_id = project_assignments[i].task_assignments[0].task.id;
              break;
          }
        }
    }
    else {
      var event_details = summary.match(/^\[([ A-Za-z0-9_@./#&+-]+)\]:([ A-Za-z0-9_@./#&+-]+)/);
      if(event_details != null) {
        harvest_event.project = event_details[1];
        harvest_event.event_summary = event_details[3];
        if("ooo" === event_details[1].toLowerCase()) {
            harvest_event.duration = 8;
        }
        else {
          for(i in project_assignments) {
            if(harvest_event.project.toLowerCase() == project_assignments[i].client.name.toLowerCase()) {
              harvest_event.client_id = project_assignments[i].client.id;
              harvest_event.task_id = project_assignments[i].task_assignments[0].task.id;
              break;
            }
          }
        }
      }
      else {
        harvest_event.event_summary = summary;
      }
    }    
    harvest_details.push(harvest_event);
  }
  return harvest_details;
}

router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user && req.user.harvest_access_token) {
      var calendar = google.calendar('v3');
      
      var OAuth2 = google.auth.OAuth2;
      //var auth = new googleAuth();
      //var oauth2Client = new auth.OAuth2(configAuth.googleAuth.clientID, configAuth.googleAuth.clientSecret,configAuth.googleAuth.callbackURL);
      var oauth2Client = new OAuth2(configAuth.googleAuth.clientID, configAuth.googleAuth.clientSecret,configAuth.googleAuth.callbackURL);
      oauth2Client.credentials = {
        access_token: req.user.access_token,
        refresh_token: req.user.refresh_token,
        token_type: 'Bearer'
      };
      
      //minTime = getMonday(new Date());
      current_date = new Date();
      minTime = new Date(current_date.setHours(0, 0, 0, 0)).toISOString();
      maxTime = new Date(current_date.setHours(23, 59, 59, 999)).toISOString();

      calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: minTime,
        timeMax: maxTime,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          res.json(err);
          return;
        }
        var events =  response.data.items;
        var harvest_details = getTimeSheetDetailsForHarvest(events);
        //res.render('calendar', {events : events});
        res.json(harvest_details);
        /*if (events.length == 0) {
          console.log('No upcoming events found.');
        } else {
          console.log('Upcoming 10 events:');
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            console.log('%s - %s', start, event.summary);
          }
        }*/
      });
    } else {
      res.render('harvest');
    }
  } else {
    res.render('index', {title: 'Express'});
  }
});

module.exports = router;