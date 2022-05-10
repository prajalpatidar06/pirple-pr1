const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const handlers = require("./lib/handlers");

// setup HTTP PORT
var httpServer = http.createServer((req, res) => unified(req, res));

httpServer.listen(config.httpPort, function () {
  console.log("server started at " + config.httpPort);
});

// setup HTTPS PORT
var httpsOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};
var httpsServer = https.createServer(httpsOptions, (req, res) =>
  unified(req, res)
);

httpsServer.listen(config.httpsPort, function () {
  console.log("server started at " + config.httpsPort);
});

// unified function for both http and https
var unified = function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;
  const decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
    buffer += decoder.end();
    var chosenHandler =
      typeof routers[trimmedPath] !== "undefined"
        ? routers[trimmedPath]
        : handlers.notFound;
    var data = {
      trimmedPath,
      payload: buffer,
      method,
      headers,
      queryStringObject,
    };
    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      payload = typeof payload === "object" ? payload : {};
      var payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(statusCode, payload);
    });
  });
};

var routers = {
  ping: handlers.ping,
  users: handlers.users,
};
