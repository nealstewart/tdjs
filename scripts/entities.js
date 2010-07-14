function Point(x, y) {
  return {
    x:  x ? x : 0,
    y:  y ? y : 0
  };
}

function Tower(x, y) {
  var tower = new Square();

  tower.type = "Tower";

  tower.location.x = x;
  tower.location.y = y;
  tower.time_last_shot = new Date().getTime();

  tower.last_target = null;
  
  tower.shoot = function (target) {
    var current_time = getCurrentTime();
    
    if ((current_time - this.time_last_shot) > 700) {
      this.time_last_shot = current_time;

      var bullet = new Square();
      bullet.width = 3;
      bullet.height = 3;
      bullet.alive = true;
      bullet.type = "bullet";
      bullet.color = "#000";
      bullet.location.x = this.location.x;
      bullet.location.y = this.location.y;
      
      bullet.velocity.x = (target.location.x - this.location.x)/5 + target.velocity.x;
      bullet.velocity.y = (target.location.y - this.location.y)/5 + target.velocity.y;

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


function Square() {
  this.color = "#CCCCCC";
  this.location = new Point();
  this.velocity = new Point(1, 0);
  this.width = 10;
  this.height = 10;
  
  this.move = function(current_time) {
    this.location.x += this.velocity.x;
    this.location.y += this.velocity.y;
  };
  
  this.draw = function() {
    var context = TD.context;
    context.strokeStyle = this.color;
    context.strokeRect(
      this.location.x, this.location.y, 
      this.width, this.height
    );
  };
}

function Enemy() {
  var enemy = new Square();
  enemy.alive = true;
  enemy.color = "#000";
  enemy.location.x = 0;
  enemy.location.y = TD.canvas.height*Math.random();
  enemy.velocity.x = 1;

  enemy.type = "enemy";
  enemy.value = 5;
  enemy.health = 2;

  return enemy;
}

function Pathfinder() {
  var pathfinder = new Square();

  pathfinder.nodeIsOpen = function(node_to_check, places, closed_places) {
    if (!places[node_to_check.location.x][node_to_check.location.y]) {
      return false;
    }

    for (var i = 0; i < closed_places.length; i++) {
      var closed_node = closed_places[i];
      if (closed_node.location.x == node_to_check.location.x &&
          closed_node.location.y == node_to_check.location.y) {
        return false;
      }
    }

    return true;
  };

  pathfinder.calcScore = function(target, spot_to_score) {
    var cumulative_score = spot_to_score.parent.score;
    var heuristic = calcDistance(target, spot_to_score);

    return cumulative_score + heuristic;
  }

  pathfinder.getAdjacentSpots = function(parent_node) {
    var directions = [
      { // up
        location: new Point(
          parent_node.location.x, 
          parent_node.location.y - 1
        ),
        "parent": parent_node
      },
      { // right
        location: new Point(
          parent_node.location.x + 1, 
          parent_node.location.y
        ),
        "parent": parent_node
      },
      { // down
        location: new Point(
          parent_node.location.x, 
          parent_node.location.y + 1
        ),
        "parent": parent_node
      },
      { // left
        location: new Point(
          parent_node.location.x - 1, 
          parent_node.location.y
        ),
        "parent": parent_node
      }
    ];

    return directions;
  }


  pathfinder.reconstructPath = function(end_point) {
    current_place = end_point;

    while (current_place.parent) {
      last_place = current_place;
      current_place = current_place.parent;
      current_place.next_node = last_place;
    }

    return current_place;
  }


  pathfinder.getOpenAdjacentSpots = function(node, places, closed_places) {
    var all_adjacent_spots = this.getAdjacentSpots(node);
    var open_adjacent_spots = [];

    for (var i in all_adjacent_spots) {
      var current_neighbor = all_adjacent_spots[i];

      if (this.nodeIsOpen(current_neighbor, places, closed_places)) {
        open_adjacent_spots.push(current_neighbor);
      }
    }

    return open_adjacent_spots;
  }

  pathfinder.getNextLowestScoringSpot = function(spots, target) {
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


  pathfinder.findPath = function(target, places) {
    var starting_node = {
      location: new Point(
        Math.floor(this.location.x/TD.GRID_SIZE), 
        Math.floor(this.location.y/TD.GRID_SIZE)
      ),
      score: 0,
      "parent": null
    }

    console.log(starting_node);

    var target_node = {
      location: new Point(
        Math.floor(target.location.x/TD.GRID_SIZE),
        Math.floor(target.location.y/TD.GRID_SIZE)
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

        if (current_node.location.x == target_node.location.x &&
            current_node.location.y == target_node.location.y) {
          found_path = true;
        }
      }
    } while (current_node != starting_node && !found_path);


    var path = null

    if (found_path) {
      path = this.reconstructPath(current_node);
    }

    return path;
  };

  return pathfinder;
}
