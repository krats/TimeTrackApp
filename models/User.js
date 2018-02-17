const mongoose = require('mongoose');

const User = mongoose.Schema({
  harvest_id: String,
  harvest_access_token: String,
  harvest_refresh_token: String,
  google_id: String,
  access_token: String,
  refresh_token: String,
  name: String,
  email: String,
  harvest_account_id: String,
  harvest_user_id: String
});

module.exports = mongoose.model('User', User);