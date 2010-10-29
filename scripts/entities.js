function Point(x, y) {
  return {
    x:  x ? x : 0,
    y:  y ? y : 0
  };
}

function Tower(x, y, context) {
  var tower = new Square(context);

  tower.type = "Tower";

  tower.coord.x = x;
  tower.coord.y = y;
  tower.time_last_shot = new Date().getTime();

  tower.last_target = null;
  
  tower.shoot = function (target) {
    var current_time = getCurrentTime();
    
    if ((current_time - this.time_last_shot) > 700) {
      this.time_last_shot = current_time;

      var bullet = new Square(context);
      bullet.width = 3;
      bullet.height = 3;
      bullet.alive = true;
      bullet.type = "bullet";
      bullet.color = "#000";
      bullet.coord.x = this.coord.x;
      bullet.coord.y = this.coord.y;
      
      bullet.velocity.x = (target.coord.x - this.coord.x)/5 + target.velocity.x;
      bullet.velocity.y = (target.coord.y - this.coord.y)/5 + target.velocity.y;

      return bullet;
    }

    return null;
  }

  tower.scanAndShoot = function(enemies) {
    var bullets_fired = [];

    for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];

      if (calcDistance(enemy, this) < 50) {
        var bullet = this.shoot(enemy);
        if (bullet) bullets_fired.push(bullet);
      }
    }

    return bullets_fired;
  }

  return tower;
}


function Square(context) {
  var context = context;
  this.color = "#CCCCCC";
  this.coord = new Point();
  this.velocity = new Point(1, 0);
  this.width = 10;
  this.height = 10;
  
  this.move = function(current_time) {
    this.coord.x += this.velocity.x;
    this.coord.y += this.velocity.y;
  };
  
  this.draw = function() {
    context.strokeStyle = this.color;
    context.strokeRect(
      this.coord.x, this.coord.y, 
      this.width, this.height
    );
  };
}

function Enemy(config) {
  var enemy = new Square(config.context);
  var open_paths = config.open_paths;
  var GRID_SIZE = config.GRID_SIZE;

  enemy.alive = true;
  enemy.color = "#000";
  enemy.velocity.x = 1;

  enemy.coord = config.coord;
  enemy.target = config.target;

  enemy.type = "enemy";
  enemy.value = 5;
  enemy.health = 2;
  enemy.has_found_path = false;

  var pathfinder = new Pathfinder(enemy, config.GRID_SIZE);
  var next_spot;

  enemy.move = function() {
    if (!this.has_found_path) {
      var current_path = pathfinder.findPath(this, this.target, open_paths, GRID_SIZE);
      next_spot = current_path.next_node;
      this.has_found_path = true;
    }

    if (next_spot) {
      this.velocity.x = (next_spot.coord.x * GRID_SIZE - this.coord.x)
      this.velocity.y = (next_spot.coord.y * GRID_SIZE - this.coord.y)

      this.coord.x += this.velocity.x;
      this.coord.y += this.velocity.y;

      if (pathfinder.sameNode(this, next_spot, GRID_SIZE)) {
        next_spot = next_spot.next_node;
      }
    }
  };

  return enemy;
}


function Pathfinder(object, grid_size_to_set) {
  var _object = object;
  var _grid_size = grid_size_to_set;

  this.nodeIsOpen = function(node_to_check, places, closed_places) {
    if (!places[node_to_check.coord.x] || 
        !places[node_to_check.coord.x][node_to_check.coord.y]) {
      return false;
    }

    for (var i = 0; i < closed_places.length; i++) {
      var closed_node = closed_places[i];
      if (closed_node.coord.x == node_to_check.coord.x &&
          closed_node.coord.y == node_to_check.coord.y) {
        return false;
      }
    }

    return true;
  };

  this.calcScore = function(target, spot_to_score) {
    var cumulative_score = spot_to_score.parent.score;
    var heuristic = calcDistance(target, spot_to_score);

    return cumulative_score + heuristic;
  }

  this.getAdjacentSpots = function(parent_node) {
    var directions = [
      { // up
        coord: new Point(
          parent_node.coord.x, 
          parent_node.coord.y - 1
        ),
        "parent": parent_node
      },
      { // up right
        coord: new Point(
          parent_node.coord.x + 1, 
          parent_node.coord.y - 1
        ),
        "parent": parent_node
      },
      { // up left
        coord: new Point(
          parent_node.coord.x - 1, 
          parent_node.coord.y - 1
        ),
        "parent": parent_node
      },

      { // right
        coord: new Point(
          parent_node.coord.x + 1, 
          parent_node.coord.y
        ),
        "parent": parent_node
      },
      { // down
        coord: new Point(
          parent_node.coord.x, 
          parent_node.coord.y + 1
        ),
        "parent": parent_node
      },
      { // down right
        coord: new Point(
          parent_node.coord.x + 1, 
          parent_node.coord.y + 1
        ),
        "parent": parent_node
      },
      { // down left
        coord: new Point(
          parent_node.coord.x - 1, 
          parent_node.coord.y + 1
        ),
        "parent": parent_node
      },
      { // left
        coord: new Point(
          parent_node.coord.x - 1, 
          parent_node.coord.y
        ),
        "parent": parent_node
      }
    ];

    return directions;
  }


  this.reconstructPath = function(end_point) {
    current_place = end_point;

    while (current_place.parent) {
      last_place = current_place;
      current_place = current_place.parent;
      current_place.next_node = last_place;
    }

    return current_place;
  }

  var _object_grid_width;
  function objectGridWidth() {
    if (!_object_grid_width) _object_grid_width = integerDivide(_object.width, _grid_size);

    return _object_grid_width;
  }

  var _object_grid_height;
  function objectGridHeight() {
    if (!_object_grid_height) _object_grid_height = integerDivide(_object.height, _grid_size);

    return _object_grid_height;
  }

  this.getOpenAdjacentSpots = function(node, places, closed_places) {
    var all_adjacent_spots = this.getAdjacentSpots(node);
    var open_adjacent_spots = [];

    for (var i in all_adjacent_spots) {
      var current_neighbor = all_adjacent_spots[i];
      
      var width = objectGridWidth();
      var height = objectGridHeight(); 

      var is_open = true;

      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          var node_to_check = {
            coord: new Point(
              current_neighbor.coord.x + x,
              current_neighbor.coord.y + y
            )
          };

          is_open = this.nodeIsOpen(node_to_check, places, closed_places);

          if (!is_open) break;
        }

        if (!is_open) break;
      }

      if (is_open) open_adjacent_spots.push(current_neighbor);
    }

    return open_adjacent_spots;
  }

  this.getNextLowestScoringSpot = function(spots, target) {
    var lowest_scoring_node = null;

    for (var i in spots) {
      spots[i].score = this.calcScore(target, spots[i]);

      if (!lowest_scoring_node || 
          spots[i].score < lowest_scoring_node.score) {

        lowest_scoring_node = spots[i];
      }
    }

    return lowest_scoring_node;
  }


  this.findPath = function(starting_coord, target, places, grid_size) {
    var starting_node = {
      coord: new Point(
        Math.floor(starting_coord.coord.x/grid_size), 
        Math.floor(starting_coord.coord.y/grid_size)
      ),
      score: 0,
      "parent": null
    };

    var target_node = {
      coord: new Point(
        Math.floor(target.coord.x/grid_size),
        Math.floor(target.coord.y/grid_size)
      )
    }

    var closed_places = [starting_node];

    var current_node = starting_node;
    var found_path = false;

    do {
      var open_adjacent_spots = this.getOpenAdjacentSpots(
          current_node, places, closed_places
      );

      var lowest_scoring_neighbour = this.getNextLowestScoringSpot(
          open_adjacent_spots, target_node
      );

      if (open_adjacent_spots.length == 0) {
        current_node = current_node.parent;
      } else {
        current_node = lowest_scoring_neighbour;
        closed_places.push(current_node);

        found_path = this.pointsAreEqual(current_node, target_node);

      }
    } while (current_node != starting_node && !found_path);


    var path = null

    if (found_path) {
      path = this.reconstructPath(current_node);
    }

    return path;
  };

  this.pointsAreEqual = function(node, target_node) {
    return (node.coord.x == target_node.coord.x
            &&
            node.coord.y == target_node.coord.y);
  }

  this.sameNode = function(entity, target_entity, grid_size) {
    var entity_node = {
      coord: new Point(
        Math.floor(entity.coord.x/grid_size), 
        Math.floor(entity.coord.y/grid_size)
      )
    }

    var target_node = {
      coord: new Point(
        Math.floor(target_entity.coord.x), 
        Math.floor(target_entity.coord.y)
      )
    }

    return this.pointsAreEqual(entity_node, target_node);
  }
}
