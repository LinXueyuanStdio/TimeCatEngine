var AV = require('leanengine');

AV.init({
  appId: process.env.LEANCLOUD_APP_ID || "lVumM4aviuXnmOCmyODnHaEs-MdYXbMMI",
  appKey: process.env.LEANCLOUD_APP_KEY || "Cy0x5uhPiNlFPCp5W8YWKKJw",
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || "Hm5L7DBWHSfYEisbvbX9IRpf"
});

// Comment the following line if you do not want to use masterKey.
AV.Cloud.useMasterKey();

var app = require('./app');

// Retrieves the port number from environment variable `LEANCLOUD_APP_PORT`.
// LeanEngine runtime will assign a port and set the environment variable automatically.
var PORT = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000);

app.listen(PORT, function (err) {
  console.log('Node app is running on port:', PORT);

  // Registers a global exception handler for uncaught exceptions.
  process.on('uncaughtException', function(err) {
    console.error("Caught exception:", err.stack);
  });
  process.on('unhandledRejection', function(reason, p) {
    console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
  });
});
