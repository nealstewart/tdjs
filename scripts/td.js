var TowerDefense = {};

var TD = TowerDefense;
TD.FRAMERATE = 100;

TD.GRID_SIZE = 5;
TD.GAME_HEIGHT = 400;
TD.GAME_WIDTH = 400;

TD.canvas;
TD.context;

TD.score = 0;
TD.resources = 0;
TD.drawables = [];
TD.movables = [];
TD.towers = [];
TD.enemies = [];

TD.initialize = function() {
  var canvas = $('#tower_defense canvas')[0];
  canvas.width = TD.GAME_WIDTH;
  canvas.height = TD.GAME_HEIGHT;

  TD.canvas = canvas;
  TD.context = canvas.getContext('2d');

  $(canvas).click( function(evt) {
    TD.spawnTower(evt.pageX - canvas.offsetLeft - 7, evt.pageY - 7 - canvas.offsetTop);
  });

  TD.updateScore();

  TD.open_paths = [];

  for (var i = 0; i < TD.canvas.width/TD.GRID_SIZE; i++) {
    TD.open_paths.push([]);
    for (var j = 0; j < TD.canvas.height/TD.GRID_SIZE; j++) {
      TD.open_paths[i].push(true);
    }
  }
};

TD.start = function() {
  TD.running = true;
  TD.drawLoop();
};

TD.spawn = function() {
  var current_time = new Date();
  current_time = current_time.getTime();

  if (!TD.last_time_spawned || (current_time - TD.last_time_spawned > 500)) {
    TD.last_time_spawned = current_time;

    TD.addEnemy();
  }
}

TD.addEnemy = function() {
  var new_enemy = new Enemy();

  TD.addMoveDrawObject(new_enemy);
  TD.enemies.push(new_enemy);
}

TD.drawEntities = function() {
  _.each(TD.drawables, function(obj) {
      obj.draw();
  });
}

TD.moveEntities = function() {
  _.each(TD.movables, function(obj){
    obj.move();

    if (obj.location.x > TD.canvas.width ||
        obj.location.x < 0) {
      TD.removeMoveDrawObject(obj);
    }
  });
}

TD.collideEntities = function() {
  _.each(TD.movables, function(first_obj){
    _.each(TD.movables, function(second_obj){
      if (collidesWith(this.first_obj, second_obj)) {
        TD.fight(first_obj, second_obj);
      }
    }, {"first_obj": first_obj});
  });
}

TD.fireTowers = function() {
  _.each(TD.towers, function(tower) {
      tower.scanAndShoot();
  });
}

TD.testLoop = function() {
  var pathfinder = new Square();
  pathfinder.findPath = function(target, open_places) {
    closed_places = [];

    // I need to keep track of the open_places some how...
    // Preferably in a set that's easy to keep track of whether it's empty...
    // I could populate a linked list with the nodes that are available
    // And remove them as I need
    do {
      
       
    } while (reachable_locations.length > 0)
  };
}

function LinkedList() {
  this.first = null;
  this.last = null;
}

function PathNode(x, y, parent_node) {
  this.x = x;
  this.y = y;
  this.parent_node = parent_node;
}

TD.drawLoop = function() {
  if (TD.running) {
    TD.fireTowers();
    TD.spawn();

    TD.moveEntities();
    TD.collideEntities();

    TD.drawBackground();
    TD.drawEntities();
  }

  setTimeout(TD.drawLoop, 1000/TD.FRAMERATE);
};

TD.fight = function(first_obj, second_obj) {
  if (first_obj.alive && second_obj.alive) {
    if (first_obj.type == "bullet" &&
        second_obj.type == "enemy") {
      second_obj.health--;

      if (second_obj.health == 0) {
        TD.movables = _.without(TD.movables, first_obj, second_obj);
        TD.drawables = _.without(TD.drawables, first_obj, second_obj);

        TD.resources += second_obj.value;
        TD.score += second_obj.value * 100;

        TD.updateScore();
      }
      else {
        TD.movables = _.without(TD.movables, first_obj);
        TD.drawables = _.without(TD.drawables, first_obj);
      }
    }
  }
}

TD.drawBackground = function() {
  var context = TD.context;
  var canvas = TD.canvas;

  context.clearRect(
    0, 0,
    canvas.width, canvas.height
  );
};

TD.drawTakenSpots = function() {
  for (var x = 0; x < TD.open_paths.length; x++) {
    for (var y = 0; y < TD.open_paths[0].length; y++) {
      if (!TD.open_paths[x][y]) {
        context.strokeStyle = "#FF0000";
        context.strokeRect(
          x * TD.GRID_SIZE,
          y * TD.GRID_SIZE,
          TD.GRID_SIZE,
          TD.GRID_SIZE
        );
      }
    }
  }
}

TD.removeMoveDrawObject = function(object) {
  TD.movables = _.without(TD.movables, object);
  TD.drawables = _.without(TD.drawables, object);
}

TD.addMoveDrawObject = function(object) {
  TD.movables.push(object);
  TD.drawables.push(object);
}

TD.initializeProfilers = function() {
  TD.collisionProfile = new Profiler("Collision");
  TD.drawProfile = new Profiler("Draw");
  TD.scanProfile = new Profiler("Scan");
}




TD.spawnTower = function(x, y) {
  var tower = new Tower(x, y);

  // Close off all of the squares in the grid that this object
  // covers.

  // Start with the top left.
  var left = Math.floor(tower.location.x/TD.GRID_SIZE);

  var right = Math.floor(
    (tower.location.x + tower.width)/5
  );

  var top = Math.floor(tower.location.y/TD.GRID_SIZE);

  var bottom = Math.floor(
    (tower.location.y + tower.height)/TD.GRID_SIZE
  );

  for (var x = left; x <= right; x++) {
    for (var y = top; y <= bottom; y++) {
      TD.open_paths[x][y] = false;
    }
  }

  TD.drawables.push(tower);
  TD.towers.push(tower);
}

TD.updateScore = function() {
  $("#score").text(TD.score);
}