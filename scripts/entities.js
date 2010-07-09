function Point(x, y) {
  return {
    x:  x ? x : 0,
    y:  y ? y : 0
  };
}

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

function Tower(x, y) {
  var tower = new Square();

  tower.type = "Tower";

  tower.location.x = x;
  tower.location.y = y;
  tower.time_last_shot = new Date().getTime();
  
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

      TD.addMoveDrawObject(bullet);
    }
  }

  tower.scanAndShoot = function() {
    _.each(TD.movables, function(obj) {
      if (obj.type && obj.type == "enemy" &&
          calcDistance(obj, this.shooter) < 50) {
        this.shooter.shoot(obj);
      }
    }, {shooter:tower});
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


