var express = require('express');
var router = express.Router();
var fetch_calender_events = require('./utils').fetch_calender_events;
var fetch_harvest_data = require('./utils').fetch_harvest_data;
var getTimeSheetDetailsForHarvest = require('./utils').getTimeSheetDetailsForHarvest;
var post_to_harvest = require('./utils').post_to_harvest;

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user && req.user.harvest_access_token) {
      fetch_calender_events(req.user.access_token, req.user.refresh_token).then(function (calender_events) {
        fetch_harvest_data("/v2/users/me", req.user.harvest_access_token, req.user.harvest_account_id).then(function (user_details) {
          req.user.harvest_user_id = user_details.id;
          req.user.save();
          fetch_harvest_data("/v2/users/" + req.user.harvest_user_id + "/project_assignments", req.user.harvest_access_token, req.user.harvest_account_id).then(function (projects_assignments) {
            projects_assignments = projects_assignments.project_assignments;
            var harvest_events = getTimeSheetDetailsForHarvest(calender_events, projects_assignments);
            for(var i=0; i<harvest_events.length; i++) {
              var today = new Date();
              var month = today.getMonth()+1;
              var date = today.getDate();
              if(month <= 9) {
                month = "0"+month;
              }
              if(date <= 9) {
                date = "0"+date;
              }
              var json_data = {
                "user_id": req.user.harvest_user_id,
                "project_id": harvest_events[i].project_id,
                "task_id": harvest_events[i].task_id,
                "spent_date": today.getFullYear() + "-" + month + "-" + date,
                "hours": harvest_events[i].duration.toString()
              };
              post_to_harvest("/v2/time_entries", req.user.harvest_access_token, req.user.harvest_account_id, json_data).then(function (data) {
                res.json({"status": "success"});
              }).then(function (err) {
                res.json(err);
              })
            }
          });
        });
      });
    } else {
      res.render('harvest');
    }
  } else {
    res.render('index', {title: 'Express'});
  }
});

module.exports = router;