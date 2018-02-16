module.exports = {
  googleAuth : {
    clientID : process.env.google_clientID,
    clientSecret : process.env.google_clientSecret,
    callbackURL :process.env.google_callbackURL
  },
  harvestAuth: {
    authorizationURL: process.env.harvest_authorizationURL,
    tokenURL: process.env.harvest_tokenURL,
    clientID: process.env.harvest_clientID,
    clientSecret: process.env.harvest_clientSecret,
    callbackURL: process.env.harvest_callbackURL
  }
};