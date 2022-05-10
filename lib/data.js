// dependencies
const fs = require("fs");
const path = require("path");

// Container for the module (to be exported)
var lib = {};

// Base Directory of data folder
lib.baseDir = path.join(__dirname + "/../.data/");

// Write data to file
lib.create = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "w",
    function (err, fileDiscriptor) {
      if (!err && fileDiscriptor) {
        // convert data to string
        var stringData = JSON.stringify(data);
        // write to file and close it
        fs.writeFile(fileDiscriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDiscriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing new file");
              }
            });
          } else {
            callback("Error writing to new file");
          }
        });
      } else {
        callback("Could not create new file, it may already exist");
      }
    }
  );
};

// Read data from file
lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    function (err, data) {
      callback(err, data);
    }
  );
};

// Update data inside a file
lib.update = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDiscriptor) {
      if (!err && fileDiscriptor) {
        // convert data to string
        var stringData = JSON.stringify(data);
        // truncate the file
        fs.ftruncate(fileDiscriptor, function (err) {
          if (!err) {
            // Write to the file and close it
            fs.writeFile(fileDiscriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDiscriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing existing file");
                  }
                });
              } else {
                callback("Error writing to existing file");
              }
            });
          } else {
            callback("Error truncating file");
          }
        });
      } else {
        callback("Could not open the file for updating , it may not exist yet");
      }
    }
  );
};

// Delete a file
lib.delete = function (dir, file, callback) {
  // unlink the file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

// Export the module
module.exports = lib;
