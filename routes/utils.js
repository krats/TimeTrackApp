// // Get harvest projects
// const options = {
//   protocol: "https:",
//   hostname: "api.harvestapp.com",
//   path: "/v2/users/me",// + req.user.harvest_user_id + "/project_assignments",
//   headers: {
//     "User-Agent": "Node.js Harvest API Sample",
//     "Authorization": "Bearer " + req.user.harvest_access_token,
//     "Harvest-Account-Id": req.user.harvest_account_id
//   }
// };
//
// https.get(options, (response) => {
//   const { statusCode } = response;
//
//   if (statusCode !== 200) {
//     console.error(`Request failed with status: ${statusCode}`);
//     return;
//   }
//
//   response.setEncoding('utf8');
//   let rawData = '';
//   response.on('data', (chunk) => { rawData += chunk; });
//   response.on('end', () => {
//     try {
//       const parsedData = JSON.parse(rawData);
//       req.user.harvest_user_id = parsedData.id;
//       req.user.save();
//       const options = {
//         protocol: "https:",
//         hostname: "api.harvestapp.com",
//         path: "/v2/users/" + req.user.harvest_user_id + "/project_assignments",
//         headers: {
//           "User-Agent": "Node.js Harvest API Sample",
//           "Authorization": "Bearer " + req.user.harvest_access_token,
//           "Harvest-Account-Id": req.user.harvest_account_id
//         }
//       };
//       https.get(options, (response) => {
//         const { statusCode } = response;
//
//         if (statusCode !== 200) {
//           console.error(`Request failed with status: ${statusCode}`);
//           return;
//         }
//
//         response.setEncoding('utf8');
//         let rawData = '';
//         response.on('data', (chunk) => { rawData += chunk; });
//         response.on('end', () => {
//           try {
//             const parsedData = JSON.parse(rawData);
//             res.json(parsedData);
//             console.log(parsedData);
//           } catch (e) {
//             console.error(e.message);
//           }
//         });
//       }).on('error', (e) => {
//         console.error(`Got error: ${e.message}`);
//       });
//       console.log(parsedData);
//     } catch (e) {
//       console.error(e.message);
//     }
//   });
// }).on('error', (e) => {
//   console.error(`Got error: ${e.message}`);
// });

var https = require('https');

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

module.exports = {fetch_harvest_data: fetch_harvest_data};

