const StaticServer = require("static-server");
const pkg = require("../../package.json");

const server = new StaticServer({
  rootPath: __dirname,
  host: pkg.ava.custom.TEST_HOST,
  port: pkg.ava.custom.TEST_PORT
});

server.start();

// for these youd need to turn off --raw on concurrently command

// server.start(function() {
//   console.log("Server listening to", server.port);
// });

// server.on("request", function(req, res) {
//   console.log("request", req.url);
// });
