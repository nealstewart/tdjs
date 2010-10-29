var TowerDefense = function() {
  var FRAMERATE = 30,
      GRID_SIZE = 5,
      GAME_HEIGHT = 400,
      GAME_WIDTH = 400,
      running = false,
      score = 0,
      resources = 0,
      drawables = [],
      movables = [],
      towers = [],
      bullets = [],
      enemies = [],
      open_paths,
      last_time_spawned,
      canvas,
      context;

  canvas = $('#tower_defense canvas')[0];
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  context = canvas.getContext('2d');

  // Private methods.
  function updateScore() {
    $("#score").text(score);
  }

  function updateResources() {
    $("#resources").text(resources);
  }

  function updateStats() {
    updateScore();
    updateResources();
  }

  function drawTakenSpots() {
    for (var x = 0, op_length = open_paths.length; x < op_length; x++) {
      for (var y = 0, row_length = open_paths[0].length; y < row_length; y++) {
        if (!open_paths[x][y]) {
          context.strokeStyle = "#FF0000";
          context.strokeRect(
            x * GRID_SIZE,
            y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
          );
        }
      }
    }
  }

  function fireTowers() {
    _.each(towers, function(tower) {
        var bullets_fired = tower.scanAndShoot(enemies);
        bullets = bullets.concat(bullets_fired);
        movables = movables.concat(bullets_fired);
        drawables = drawables.concat(bullets_fired);
    });
  }

  function addMoveDrawObject(object) {
    movables.push(object);
    drawables.push(object);
  }

  function addEnemy() {
    if (enemies.length < 10) {
      var new_enemy = new Enemy({
        coord: {
          x: 0,
          y: canvas.height*Math.random()
        },
        foobar: {x:0, y:5},
        GRID_SIZE: GRID_SIZE,
        context: context,
        open_paths: open_paths,
        target: {
          coord: new Point(300, 300)
        }
      });

      addMoveDrawObject(new_enemy);
      enemies.push(new_enemy);
    }
  }

  function spawn() {
    var current_time = new Date();
    current_time = current_time.getTime();

    if (!last_time_spawned || (current_time - last_time_spawned > 500)) {
      last_time_spawned = current_time;

      addEnemy();
    }
  }

  function spawnTower(x, y) {
    var tower = new Tower(x, y, context);

    // Close off all of the squares in the grid that this object
    // covers.

    // Start with the top left.
    var left = Math.floor(tower.coord.x/GRID_SIZE);

    var right = Math.floor(
      (tower.coord.x + tower.width)/5
    );

    var top = Math.floor(tower.coord.y/GRID_SIZE);

    var bottom = Math.floor(
      (tower.coord.y + tower.height)/GRID_SIZE
    );

    for (var x = left; x <= right; x++) {
      for (var y = top; y <= bottom; y++) {
        open_paths[x][y] = false;
      }
    }

    drawables.push(tower);
    towers.push(tower);
  }

  function removeObject(object) {
    movables = _.without(movables, object);
    drawables = _.without(drawables, object);

    switch (object.type) {
    case "enemy" :
      enemies = _.without(enemies, object);
      break;
    case "bullet" :
      bullets = _.without(bullets, object);
      break;
    }
  }

  function moveEntities() {
    _.each(movables, function(obj){
      obj.move();

      if (obj.coord.x > canvas.width ||
          obj.coord.x < 0) {
        removeObject(obj);
      }
    });
  }

  function fight(first_obj, second_obj) {
    if (first_obj.alive && second_obj.alive) {
      if (first_obj.type == "bullet" &&
          second_obj.type == "enemy") {
        second_obj.health--;

        if (second_obj.health == 0) {
          removeObject(first_obj);
          removeObject(second_obj);

          resources += second_obj.value;
          score += second_obj.value * 100;

          updateStats();
        }
        else {
          removeObject(first_obj);
        }
      }
    }
  }

  function collideEntities() {
    _.each(movables, function(first_obj){
      _.each(movables, function(second_obj){
        if (collidesWith(this.first_obj, second_obj)) {
          fight(first_obj, second_obj);
        }
      }, {"first_obj": first_obj});
    });
  }

  function drawBackground() {
    context.clearRect(
      0, 0,
      canvas.width, canvas.height
    );
  }

  function drawEntities() {
    _.each(drawables, function(obj) {
        obj.draw();
    });
  }

  function drawLoop() {
    if (running) {
      fireTowers();
      spawn();

      moveEntities();
      collideEntities();

      drawBackground();
      drawEntities();
    }

    setTimeout(drawLoop, 1000/FRAMERATE);
  }


  // Initialization methods
  (function initializeCanvasClick() {
    $(canvas).click( function(evt) {
      spawnTower(evt.pageX - canvas.offsetLeft - 7, evt.pageY - 7 - canvas.offsetTop);
    });
  })();

  (function initializePaths() {
    open_paths = [];

    for (var i = 0; i < canvas.width/GRID_SIZE; i++) {
      open_paths.push([]);
      for (var j = 0; j < canvas.height/GRID_SIZE; j++) {
        open_paths[i].push(true);
      }
    }
  })();

  //----------------------------------------
  // Public methods
  function start() {
    running = true;

    drawLoop();
  }

  function stop() {
    running = false;
  }

  updateScore();

  this.start = start;
  this.stop = stop;
};
