Package.describe({
  name: "bluehive:login-links",
  version: "0.1.4",
  summary:
    "Send links that automatically login the user with OTPs (one-time passwords)",
  git: "https://github.com/bluehive-health/login-links.git",
});

Package.onUse(function (api) {
  api.versionsFrom(["3.0.2"]);
  api.use(["ecmascript", "accounts-base", "mongo", "check"]);

  api.addFiles(["common/login-links.js", "common/accessToken.js"]);

  api.addFiles(["client/login-links.js"], "client");

  api.addFiles(
    [
      "server/login-links.js",
      "server/clearOldTokens.js",
      "server/connectionLogin.js",
      "server/loginHandler.js",
    ],
    "server"
  );

  api.export("LoginLinks");
});

Package.onTest(function (api) {
  api.use([
    "bluehive:login-links",
    "ecmascript",
    "tinytest",
    "meteor-base",
    "accounts-password",
  ]);

  api.addFiles("tests/helpers.js");

  api.addFiles(
    ["tests/server/helpers.js", "tests/server/accessToken.js"],
    "server"
  );

  api.addFiles(
    [
      "tests/client/helpers.js",
      "tests/client/loginHandler.js",
      "tests/client/connectionLogin.js",
    ],
    "client"
  );
});
