const StaticServer = require("static-server");
const pkg = require("../../package.json");

const server = new StaticServer({
  rootPath: __dirname,
  host: pkg.ava.custom.TEST_HOST,
  port: pkg.ava.custom.TEST_PORT
});

if (pkg.ava.custom.LOG_SERVER) {
  server.start(function() {
    console.log("Test Server listening to", server.port);
  });

  server.on("request", function(req, res) {
    console.log("\nrequest", req.url);
  });
} else {
  server.start();
}
