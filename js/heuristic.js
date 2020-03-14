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
    // use the model's internal food counter
    return m.foodCount;
  },


  // seeks to minimize the distance to nearest food
  food_distance: function() {
    var nearest = Number.MAX_SAFE_INTEGER;
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
    var nearest = Number.MAX_SAFE_INTEGER;
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

  // heuristic based on the center positioning of all the food on the map
  food_centerM: function(m) {
    var count = 0;
    var px = 0;
    var py = 0;
    for (var y = 0; y < 29; y++) {
      var wy = m.World[y];
      for(var x = 0; x < 26; x++) {
        if(wy[x] == 'F') {
          px += x;
          py += y;
          count++;
          /*
          var dist = Math.abs(x - px) + Math.abs(y - py);
          if(dist < nearest) {
            nearest = dist;
          }
          */
        }
      }
    }
    var calc = Math.abs((px)/count - m.pacmanX) + Math.abs((py)/count - m.pacmanY);
    return calc;
  },


  // closest ghost
  ghost_distance: function() {
    var nearest = Number.MAX_SAFE_INTEGER;
    for(var x = 0; x < 4; x++) {
      var pos = getGhostPosByNum(x);

      var dist = Math.abs(pos.x - PACMAN_POSITION_X) + Math.abs(pos.y - PACMAN_POSITION_Y);

      if(dist < nearest) {
        nearest = dist;
      }
    }
    return -nearest;
  },

  /*
  player_distanceM: function(m) {
    var nearest = Number.MAX_SAFE_INTEGER;
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
    return nearest;
  },
  */

  // closest ghost
  ghost_distanceM: function(m) {
    var nearest = Number.MAX_SAFE_INTEGER;
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
    return -nearest;
  },

  // combo heuristic, prioritizes food unless ghosts are too close
  combo_ghost_food: function() {
    var fd = Heuristic.food_distance();
    var gd = Heuristic.ghost_distance();

    if(Math.abs(gd) < 175) {
      // run away from ghosts
      return gd;

    } else {
      // eat food
      return fd;

    }
  },

  // combo heuristic, prioritizes food unless ghosts are too close
  combo_ghost_foodM: function(m) {
    var fd = Heuristic.food_distanceM(m);
    var gd = Heuristic.ghost_distanceM(m);

    if(Math.abs(gd) < 10) {
      // run away
      return gd;

    } else {
      // eat food
      return fd;

    }
  },

  combo_ghostDist_foodCount: function(m) {
    var fc = Heuristic.food_countM(m);
    var gd = Heuristic.ghost_distanceM(m);

    return fc + gd;
  },

  // sum of closest food & closest ghost distance
  comboM: function(m) {
    //var fd = Heuristic.food_distanceM(m);
    var gd = Heuristic.ghost_distanceM(m);
    var vertDist = Math.abs(m.pacmanY - 14);
    return vertDist * 0.25 + (gd);
  },

  // weights ghost distance higher when closer than 9
  // otherwise weights food higher by 1.5
  // combines gdist + fdist + fcount
  combo_run_or_foodandghostsM: function(m) {
    var gd = Heuristic.ghost_distanceM(m);

    var fd = Heuristic.food_countM(m);
    //var vertDist = Math.abs(m.pacmanY - 14);
    var fc = Heuristic.food_centerM(m) * 0.1;

    if(gd < 9) {
      gd *= 1.5;
    } else {
      fc *= 1.5;
    }

    //if(Math.abs(gd) < 12) {
      // run
      //return gd;

    //} else {
      // combo thing
    return gd * 0.4 + fd * 0.3 + fc;

    //}
  },

  // combo heuristic, prioritizes food unless ghosts are too close
  combo_run_chase_find_foodM: function(m) {
    var fd = Heuristic.food_distanceM(m);
    //var fd = Heuristic.food_countM(m);
    var gd = Heuristic.ghost_distanceM(m);

    if(Math.abs(gd) < 10) {
      // run or fight ghosts
      if(
        (GHOST_BLINKY_STATE > 0 && Heuristic.closestGhost == 0) ||
        (GHOST_PINKY_STATE > 0 && Heuristic.closestGhost == 1) ||
        (GHOST_INKY_STATE > 0 && Heuristic.closestGhost == 2) ||
        (GHOST_CLYDE_STATE > 0 && Heuristic.closestGhost == 3)
      ) {
        // chase!
        return Math.abs(gd);

      } else if(
        (GHOST_BLINKY_STATE == 0 && Heuristic.closestGhost == 0) ||
      (GHOST_PINKY_STATE == 0 && Heuristic.closestGhost == 1) ||
      (GHOST_INKY_STATE == 0 && Heuristic.closestGhost == 2) ||
      (GHOST_CLYDE_STATE == 0 && Heuristic.closestGhost == 3)
    ) {
        // run away
        return gd;

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
