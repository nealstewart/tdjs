require([
  "scripts/underscore-min.js",
  "scripts/helpers.js",
  "scripts/entities.js",
  "scripts/td.js"

], function() {
  $(function() {
    TD.initialize();
    TD.start();
  });
});
