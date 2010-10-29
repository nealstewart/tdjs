require([
  "scripts/underscore-min.js",
  "scripts/helpers.js",
  "scripts/entities.js",
  "scripts/td.js"

], function() {
  $(function() {
    window.TD = new TowerDefense();
    TD.start();
  });
});
