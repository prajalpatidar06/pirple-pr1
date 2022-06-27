var environment = {};

//Staging (default) environment
environment.staging = {
  httpPort: 3003,
  httpsPort: 3005,
  envName: "staging",
  hashingSecret: "thisIsASecret",
};

// Production object
environment.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAlsoASecret",
};
const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase().trim()
    : "";
const environmentToExport =
  typeof environment[currentEnvironment] === "object"
    ? environment[currentEnvironment]
    : environment.staging;
module.exports = environmentToExport;
