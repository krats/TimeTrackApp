const mongoose = require('mongoose');

const User = mongoose.Schema({
  harvest_id: String,
  harvest_access_token: String,
  harvest_refresh_token: String,
  google_id: String,
  access_token: String,
  name: String,
  email: String
});

module.exports = mongoose.model('User', User);