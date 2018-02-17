var https = require('https');
var google = require('googleapis');
var configAuth = require('../config/auth');

var fetch_harvest_data = function (path, harvest_access_token, harvest_account_id) {
  return new Promise(function (resolve, reject) {

    const options = {
      protocol: "https:",
      hostname: "api.harvestapp.com",
      path: path,
      headers: {
        "User-Agent": "Node.js Harvest API Sample",
        "Authorization": "Bearer " + harvest_access_token,
        "Harvest-Account-Id": harvest_account_id
      }
    };

    https.get(options, (response) => {
      const { statusCode } = response;

      if (statusCode !== 200) {
        console.error(`Request failed with status: ${statusCode}`);
        reject({errorCode: statusCode});
        return;
      }

      response.setEncoding('utf8');
      let rawData = '';
      response.on('data', (chunk) => { rawData += chunk; });
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
          reject(e.message);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
      reject({errorMessage: e.message});
    });

  });
};

function getMonday(d) {
  d = new Date(d);
  let day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6:1);
  let date_monday = new Date(d.setDate(diff));
  date_monday.setHours(0,0,0,0);
  return date_monday.toISOString();
}

function getTimeSheetDetailsForHarvest(events, project_assignments) {

  let harvest_details = [];
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

var fetch_calender_events = function (google_access_token, google_refresh_token) {
  return new Promise(function (resolve, reject) {
    var calendar = google.calendar('v3');
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(configAuth.googleAuth.clientID, configAuth.googleAuth.clientSecret,configAuth.googleAuth.callbackURL);
    oauth2Client.credentials = {
      access_token: google_access_token,
      refresh_token: google_refresh_token,
      token_type: 'Bearer'
    };

    minTime = getMonday(new Date());

    calendar.events.list({
      auth: oauth2Client,
      calendarId: 'primary',
      timeMin: minTime,
      timeMax: (new Date()).toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
        return;
      }
      var events =  response.data.items;
      resolve(events);
    });
  });
};

module.exports = {
  fetch_harvest_data: fetch_harvest_data,
  fetch_calender_events: fetch_calender_events,
  getTimeSheetDetailsForHarvest: getTimeSheetDetailsForHarvest
};

