const needle = require('needle');
let APIKey = ""; //Lmao not using my Steam API Key

class csgoStatsNode {

  constructor(opts) {
    if (opts['apikey'] == "" | opts['apikey'] == undefined) {
      console.error("You need a Steam API key to use CsgoStatsNode Library.");
      process.exit(0);
    } else {
      APIKey = opts['apikey'];
    }
  }

  callAPI(steamID = '', type = 'csgoStats', cb) {
    try {
      switch (type) {
        case "csgoStats":
          needle.get('http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=' + APIKey + '&steamid=' + steamID, function (err, resp) {
            if (err) return cb(err);
            if (resp.statusCode === 200) {
              return cb(null, resp.body);
            } else {
              return cb(new Error('API Request Failed'));
            }
          });
          break;

        case "getBans":
          needle.get('http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=' + APIKey + '&steamids=' + steamID, function (err, resp) {
            if (err) return cb(err);
            if (resp.statusCode === 200) {
              return cb(null, resp.body);
            } else {
              return cb(new Error('API Request Failed'));
            }
          });
          break;

        case "getProfile":
          needle.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + APIKey + '&steamids=' + steamID, function (err, resp) {
            if (err) return cb(err);
            if (resp.statusCode === 200) {
              return cb(null, resp.body);
            } else {
              return cb(new Error('API Request Failed'));
            }
          });
          break;

        case "vanityURL":
          needle.get('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + APIKey + '&vanityurl=' + steamID, function (err, resp) {
            if (err) return cb(err);
            if (resp.statusCode === 200) {
              if (resp.body.response.success === 42) {
                return cb(new Error('Invalid VanityURL'));
              }
              return cb(null, resp.body);
            } else {
              return cb(new Error('API Request Failed'));
            }
          });
          break;

        default:
          return cb(new Error('Invalid Function Name Supplied'));
      }
    } catch (error) {
      return cb(error, null);
    }
  }


  /**
    Main Class Purpose
    Will take a steamID and retun all CSGO related data later versions of the class will have seperate functions
    to get diffrent pieces of data
  **/
  getStats(sID, cb) {
    if (typeof cb === 'function') {
      // Callback function supplied
      this.callAPI(sID, 'csgoStats', (err, d7) => {
        if (err) return cb(err, null);
        return cb(null, d7);
      })
    } else {
      // Return Promise if callback not supplied 
      return new Promise((resolve, reject) => {
        this.callAPI(sID, 'csgoStats', (err, d7) => {
          if (err) return reject(err);
          return resolve(d7);
        })
      });
    }
  }

  // Updated to a new Promise Overloading Function
  getProfile(sID, cb) {
    if (typeof cb === 'function') {
      // Callback Supplied
      this.callAPI(sID, "getProfile", (err, data) => {
        if (err) return cb(err, null);
        return cb(null, data['response']['players'][0]);
      });
    } else {
      // Return Promise if callback not supplied 
      return new Promise((resolve, reject) => {
        this.callAPI(sID, "getProfile", (err, data) => {
          if (err) return reject(err);
          return resolve(data['response']['players'][0]);
        });
      });
    }
  }

  getProfilePic(sID, cb) {
    if (typeof cb === 'function') {
      this.getProfile(sID, (err, data) => {
        if (err) return cb(err, null);
        return cb(null, data['avatarfull']);
      });
    } else {
      return new Promise((resolve, reject) => {
        this.getProfile(sID, (err, data) => {
          if (err) return reject(err);
          return resolve(data['avatarfull']);
        });
      });
    }
  }

  // Get Profile Name
  getProfileName(sID, cb) {
    if (typeof cb === 'function') {
      this.getProfile(sID, (err, data) => {
        if (err) return cb(err, null);
        return cb(null, data['personaname']);
      });
    } else {
      return new Promise((resolve, reject) => {
        this.getProfile(sID, (err, data) => {
          if (err) return reject(err);
          return resolve(data['personaname']);
        });
      });
    }
  }

  // Calculate KD and return the number
  getKD(kills, deaths) {
    let kd = (kills / deaths).toFixed(2);
    return kd;
  }

  // Return a Valid Steam64 ID by resolving custom user ID.
  getSteamID(vanityURL, cb) {
    if (typeof cb === 'function') {
      this.callAPI(vanityURL, "vanityURL", (err, data) => {
        if (err) return cb(err, null);
        return cb(null, data['response']['steamid']);
      });
    } else {
      return new Promise((resolve, reject) => {
        this.callAPI(vanityURL, "vanityURL", (err, data) => {
          if (err) return reject(err);
          return resolve(data['response']['steamid']);
        });
      });
    }
  }

  getBans(sID, cb) {
    if (typeof cb === 'function') {
      this.callAPI(sID, "getBans", (err, data) => {
        if (err) return cb(err, null);
        return cb(null, data['players'][0]);
      })
    } else {
      return new Promise((resolve, reject) => {
        this.callAPI(sID, "getBans", (err, data) => {
          if (err) return reject(err);
          return resolve(data['players'][0]);
        })
      });
    }
  }

  hasVac(sID, cb) {
    if (typeof cb === 'function') {
      this.getMyBans(sID, (err, data) => {
        if (err) return cb(err, null);
        if (data['VACBanned'] == true) {
          return cb(null, true);
        } else {
          return cb(null, false);
        }
      });
    } else {
      return new Promise((resolve, reject) => {
        this.getMyBans(sID, (err, data) => {
          if (err) return reject(err);
          if (data['VACBanned'] == true) {
            return resolve(true);
          } else {
            return resolve(false);
          }
        });
      });
    }
  }

}

module.exports = csgoStatsNode;
