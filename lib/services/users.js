const _data = require("../data");
const helpers = require("../helpers");
const verifyToken = require("./tokens").verifyToken;
var _users = {};
// users - post
// Required data: firstName,lastName,phone,password,tosAgreement
// optional data: none
_users.post = function (data, callback) {
  // check that all the required field are filled out
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;
  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user does not already exist
    _data.read("users", phone, function (err, data) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          // create user object
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };
          // store the user
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash user's password" });
        }
      } else {
        // user already exists
        callback(400, {
          Error: "A user with that phone number already exists",
        });
      }
    });
  } else {
    console.log(data.payload);
    callback(400, {
      Error: "Missing required fields",
      firstName,
      lastName,
      phone,
      password,
      tosAgreement,
    });
  }
};

// users - put
// Required data: phone
// Optional data: firstName,lastName,password (atleast one must be specified)
_users.put = function (data, callback) {
  // check for the required field
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  // check for optional fields
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      var token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
          // lookup the user
          _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
              // Update the fields necessary
              userData.firstName = firstName ? firstName : userData.firstName;
              userData.lastName = lastName ? lastName : userData.lastName;
              userData.hashedPassword = password
                ? helpers.hash(password)
                : userData.hashedPassword;
              // store the new updates
              _data.update("users", phone, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not update the user" });
                }
              });
            } else {
              callback(400, { Error: "The specified user does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// users - get
// Required data: phone
// optional data: none
_users.get = function (data, callback) {
  // check that the phone number is valid
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Get the token from headers
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    // Verify the given token is valid for phone number
    verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            // Removed hashedPassword from the user object before returning it to request
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: " Missing required field" });
  }
};

// users delete
// Required data: phone
// @Todo cleanup(delete) any other data files associated with this user
_users.delete = function (data, callback) {
  // check that the phone number is valid
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            _data.delete("users", phone, function (err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: " Missing required field" });
  }
};

module.exports = _users;
