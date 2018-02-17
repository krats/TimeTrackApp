var express = require('express');
var router = express.Router();
var fetch_calender_events = require('./utils').fetch_calender_events;
var fetch_harvest_data = require('./utils').fetch_harvest_data;
var getTimeSheetDetailsForHarvest = require('./utils').getTimeSheetDetailsForHarvest

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
            res.json(getTimeSheetDetailsForHarvest(calender_events, projects_assignments));
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