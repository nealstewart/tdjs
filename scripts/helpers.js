function randomInteger(height) {
  return Math.floor(Math.random()*height);
}

function integerDivide(numerator, denominator) {
  return Math.floor(numerator/denominator)
}

function randPosNegInt(absoluteRange) {
  switch (randomInteger(2)) {
    case 0:
      return -randomInteger(absoluteRange);
    case 1:
      return randomInteger(absoluteRange);
  }
}

function calcDistance(object1, object2) {
  var x_dist = object1.coord.x - object2.coord.x;
  var y_dist = object1.coord.y - object2.coord.y;

  return Math.sqrt(x_dist * x_dist + y_dist * y_dist);
}

function getCurrentTime() {
  var t = new Date();
  return t.getTime();
}

function Profiler(name) {
  this.name = name;
  this.sample_count = 0;
  this.sample_sum = 0;

  this.averageTime = function() {
    return this.sample_sum/this.sample_count;
  };

  this.addTime = function(time) {
    if (!time) time = getCurrentTime();
    this.sample_sum += time;
    this.sample_count++;
  }

  this.toString = function() {
    return name + " takes " + this.averageTime() + "ms on average."
  }
}

function collidesWith(object1, object2) {
  first_ls = object1.coord.x;
  first_rs = object1.coord.x + object1.width;
  first_top = object1.coord.y;
  first_bottom = object1.coord.y + object1.height;

  second_ls = object2.coord.x;
  second_rs = object2.coord.x + object2.width;
  second_top = object2.coord.y;
  second_bottom = object2.coord.y + object2.height;

  var object1_outside_object2 =
    first_rs < second_ls ||
    first_ls > second_rs ||
    first_bottom < second_top ||
    first_top > second_bottom;

  return !object1_outside_object2; 
};

