const crypto = require("crypto");
const config = require("../config");
var helpers = {};

// create a SHA56 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    return crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
  } else {
    return false;
  }
};

// Parse json string into object in all cases without throwing
helpers.parseJsonToObject = function (str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return {};
  }
};

// create a string of random alphanumeric charecters, of given length
helpers.createRandomString = function (strLength) {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters go into a string
    var possibleCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    // start the final string
    var str = "";
    for (i = 1; i <= strLength; i++) {
      // Get a random charecter from the possibleCharacters string
      var radomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // Append this character to the final string
      str += radomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

// Export the module
module.exports = helpers;
