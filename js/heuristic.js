//
// heuristic.js
//
// Heuristics to use
//

var Heuristic = {

  // to minimize the food count
  food_count: function() {
    var count = 0;
    for (var i = 0, imax = BUBBLES_ARRAY.length; i < imax; i ++) {
  		var bubble = BUBBLES_ARRAY[i];

  		var bubbleParams = bubble.split(";");

      if(bubbleParams[4] == "0") {
        // bubble to count
        count++;
      }
    }
    return count;
  },

  // to minimize the food count
  food_countM: function(m) {
    var count = 0;
    for (var y = 0; y < 29; y++) {
      for(var x = 0; x < 26; x++) {
        if(m.World[y][x] == 'F') {
          count++;
        }
      }
    }
    return count;
  },


  // seeks to minimize the distance to nearest food
  food_distance: function() {
    var nearest = 99999999999;
    for (var i = 0; i < BUBBLES_ARRAY.length; i ++) {
  		var bubble = BUBBLES_ARRAY[i];

  		var bubbleParams = bubble.split(";");

      var testX = parseInt(bubbleParams[0].split( "," )[0]);
  		var testY = parseInt(bubbleParams[0].split( "," )[1]);

      if(bubbleParams[4] == "0") {
        // bubble to use
        var dist = Math.abs(testX - PACMAN_POSITION_X) + Math.abs(testY - PACMAN_POSITION_Y);

        if(dist < nearest) {
          nearest = dist;
        }
      }
    }
    return nearest;
  },

  // to minimize the food count
  food_distanceM: function(m) {
    var count = 0;
    var nearest = 99999999999;
    var px = m.pacmanX;
    var py = m.pacmanY;
    for (var y = 0; y < 29; y++) {
      var wy = m.World[y];
      for(var x = 0; x < 26; x++) {
        if(wy[x] == 'F') {
          var dist = Math.abs(x - px) + Math.abs(y - py);
          if(dist < nearest) {
            nearest = dist;
          }
        }
      }
    }
    return nearest;
  },


  // closest ghost
  ghost_distance: function() {
    var nearest = 99999999;
    for(var x = 0; x < 4; x++) {
      var pos = getGhostPosByNum(x);

      var dist = Math.abs(pos.x - PACMAN_POSITION_X) + Math.abs(pos.y - PACMAN_POSITION_Y);

      if(dist < nearest) {
        nearest = dist;
      }
    }
    return 1000.0-nearest;
  },

  // closest ghost
  ghost_distanceM: function(m) {
    var nearest = 99999999;
    var px = m.pacmanX;
    var py = m.pacmanY;
    for(var x = 0; x < 4; x++) {
      var pos = m.ghostPos[x];

      var dist = Math.abs(pos.x - px) + Math.abs(pos.y - py);

      if(dist < nearest) {
        nearest = dist;
        this.closestGhost = x;
      }
    }
    return 1000.0-nearest;
  },

  // combo heuristic, prioritizes food unless ghosts are too close
  combo_ghost_food: function() {
    var fd = Heuristic.food_distance();
    var gd = Math.abs(Heuristic.ghost_distance()-1000.0);

    if(gd < 175) {
      // run away from ghosts
      return 1000.0-gd;

    } else {
      // eat food
      return fd;

    }
  },

  // combo heuristic, prioritizes food unless ghosts are too close
  combo_ghost_foodM: function(m) {
    var fd = Heuristic.food_distanceM(m);
    var gd = Math.abs(Heuristic.ghost_distanceM(m)-1000.0);

    if(gd < 10) {
      // run away
      return 300.0-gd;

    } else {
      // eat food
      return fd;

    }
  },

  // sum of closest food & closest ghost distance
  comboM: function(m) {
    var fd = Heuristic.food_distanceM(m);
    var gd = Math.abs(Heuristic.ghost_distanceM(m)-1000.0);
    return fd + (300.0 - gd);
  },

  // combo heuristic, prioritizes food unless ghosts are too close
  combo_run_chase_find_foodM: function(m) {
    var fd = Heuristic.food_distanceM(m);
    var gd = Math.abs(Heuristic.ghost_distanceM(m)-1000.0);

    if(gd < 9) {
      // run or fight ghosts
      if(
        (GHOST_BLINKY_STATE > 0 && Heuristic.closestGhost == 0) ||
        (GHOST_PINKY_STATE > 0 && Heuristic.closestGhost == 1) ||
        (GHOST_INKY_STATE > 0 && Heuristic.closestGhost == 2) ||
        (GHOST_CLYDE_STATE > 0 && Heuristic.closestGhost == 3)
      ) {
        // chase!
        return gd;

      } else if(
        (GHOST_BLINKY_STATE == 0 && Heuristic.closestGhost == 0) ||
      (GHOST_PINKY_STATE == 0 && Heuristic.closestGhost == 1) ||
      (GHOST_INKY_STATE == 0 && Heuristic.closestGhost == 2) ||
      (GHOST_CLYDE_STATE == 0 && Heuristic.closestGhost == 3)
    ) {
        // run away
        return 300.0-gd;
      } else {
        // else ignore, focus on food
        return fd;
      }

    } else {
      // eat food
      return fd;

    }
  },

};
