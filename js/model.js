//
// model.js
//
// Stores the world as a model we can search from,
// and safely restore state back
//

function getQuantizedPosition(px, py) {
  var best = 999999;
  var bestPos = 0;
  for (var yl = 1; yl <= 29; yl++) {
		var y = getYFromLine(yl);
		for (var x = BUBBLES_X_START, xmax = BUBBLES_X_END, bubble = 1 ; x < xmax; bubble ++, x += BUBBLES_GAP) {
      var dist = Math.abs(px - correctionX(x,bubble)) + Math.abs(py - y);
      /*
      if(dist < 8.0) {
        // assert this our new pacman position
        return {x: x-1, y: line-1};
      }
      */
      if(dist < best) {
        best = dist;
        bestPos = {x: bubble-1, y: yl-1};
      }
    }
  }

  // return the closest position we could match to
  return bestPos;
}


function Model() {
  this.stringRep = false;
}

Model.prototype = {

  __constructor: Model,

  // stores world as an array model
  // each space can be wall, food, empty
  // player is known, and bots are known
  // all quantized
  // actions can be performed on them
  storeWorld2: function() {
    // store pacman quantize position
    var pos = getQuantizedPosition(PACMAN_POSITION_X, PACMAN_POSITION_Y);
    this.pacmanX = pos.x;
    this.pacmanY = pos.y;

    // store ghost quantized positions
    this.ghostPos = [];
    this.ghostPos.push(getQuantizedPosition(GHOST_BLINKY_POSITION_X, GHOST_BLINKY_POSITION_Y));
    this.ghostPos.push(getQuantizedPosition(GHOST_PINKY_POSITION_X, GHOST_PINKY_POSITION_Y));
    this.ghostPos.push(getQuantizedPosition(GHOST_INKY_POSITION_X, GHOST_INKY_POSITION_Y));
    this.ghostPos.push(getQuantizedPosition(GHOST_CLYDE_POSITION_X, GHOST_CLYDE_POSITION_Y));

    // TODO TESTING Recording Grid to Quantize and Search via
  	var World = [];
    var bubbleIndex = 0;
  	var gap = ((BUBBLES_X_END - BUBBLES_X_START) / 26)+2.5;
  	for (var line = 1, linemax = 29, i = 0, s = 0; line <= linemax; line ++) {
  		var WorldLine = [];
  		var y = getYFromLine(line);
  		for (var x = BUBBLES_X_START, xmax = BUBBLES_X_END, bubble = 1 ; x < xmax; bubble ++, x += BUBBLES_GAP) {
  			if (canAddBubble(line, bubble)) {
  				// bubble
          var bubbleItem = BUBBLES_ARRAY[bubbleIndex];
          var bubbleParams = bubbleItem.split(";");
          if(bubbleParams[4] == "0") {
            // still a bubble to count
            WorldLine.push('F');

          } else {
            // no longer a bubble, just a path space
            WorldLine.push('P');

          }

          bubbleIndex++;

  			} else if(
  				((line == 9 || line == 10) && (bubble == 12 || bubble == 15)) ||
  				((line == 11 || line == 17) && (bubble >= 9 && bubble <= 18)) ||
  				((line >= 12 && line <= 19) && (bubble == 9 || bubble == 18)) ||
  				((line == 14) && (bubble == 7 || bubble == 8 || bubble == 19 || bubble == 20 || bubble <= 5 || bubble >= 22))
  			) {
  				// open path
  				WorldLine.push('P');
  			} else {
  				// wall
  				WorldLine.push('W');
  			}
  		}
  		World.push(WorldLine);
  	}

  	this.World = World;


  },

  // returns whether a given x & y would result in a valid space being occupied
  isValidSpace: function(x,y) {
    return (
      (x >= 0 && x <= 25 && y >= 0 && y <= 28 &&
      (this.World[y][x] == 'F' || this.World[y][x] == 'P')) ||
      ((x <= 0 || x >= 25) && y == 14)
    );
  },

  // 1 = +X (RIGHT)
  // 2 = +Y (DOWN)
  // 3 = -X (LEFT)
  // 4 = -Y (UP)
  canMove: function(dir) {
    if(dir == 1) {
      return this.isValidSpace(this.pacmanX+1,this.pacmanY);
    } else if(dir == 2) {
      return this.isValidSpace(this.pacmanX,this.pacmanY+1);
    } else if(dir == 3) {
      return this.isValidSpace(this.pacmanX-1,this.pacmanY);
    } else if(dir == 4) {
      return this.isValidSpace(this.pacmanX,this.pacmanY-1);

    }
  },

  // apply a move to pacman in the model
  movePacman: function(dir) {
    if(dir == 1) {
      this.pacmanX+=1
    } else if(dir == 2) {
      this.pacmanY+=1;
    } else if(dir == 3) {
      this.pacmanX-=1;
    } else if(dir == 4) {
      this.pacmanY-=1;
    }

    if(this.World.length == 0) {
      console.error("World is not properly initialized yet.");
    }

    // update food
    if(this.World[this.pacmanY][this.pacmanX] == 'F') {
      // change to 'P'
      this.World[this.pacmanY][this.pacmanX] = 'P';
      this.didEatFood = true;

    }
  },

  storeWorld: function() {
    this.storePacman();
    this.storeFood();
    this.storeGhosts();
  },

  restoreWorld: function() {
    this.restorePacman();
    this.restoreFood();
    this.restoreGhosts();
  },

  // stores existing game model to make calculations based on
  storePacman: function() {
    this.pacmanDirection = PACMAN_DIRECTION;
    this.pacmanDirTry = PACMAN_DIRECTION_TRY;

    this.pacmanDirTryTimer = PACMAN_DIRECTION_TRY_TIMER;
    this.pacmanMouthState = PACMAN_MOUNTH_STATE;

    this.pacmanX = PACMAN_POSITION_X;
    this.pacmanY = PACMAN_POSITION_Y;
    this.pacmanMoving = PACMAN_MOVING;
    this.pacmanDead = PACMAN_DEAD;
  },

  storeFood: function() {
    this.bubbles = BUBBLES_ARRAY;
    this.fruitX = FRUITS_POSITION_X;
    this.fruitY = FRUITS_POSITION_Y;
  },

  storeGhosts: function() {
    this.ghostBlinky_X = GHOST_BLINKY_POSITION_X;
    this.ghostBlinky_Y = GHOST_BLINKY_POSITION_Y;
    this.ghostBlinky_Dir = GHOST_BLINKY_DIRECTION;
    this.ghostBlinky_Moving = GHOST_BLINKY_MOVING;
    this.ghostBlinky_BodyState = GHOST_BLINKY_BODY_STATE;
    this.ghostBlinky_State = GHOST_BLINKY_STATE;
    this.ghostBlinky_EatTimer = GHOST_BLINKY_EAT_TIMER;
    this.ghostBlinky_AfraidTimer = GHOST_BLINKY_AFFRAID_TIMER;
    this.ghostBlinky_AfraidState = GHOST_BLINKY_AFFRAID_STATE;
    this.ghostBlinky_Tunnel = GHOST_BLINKY_TUNNEL;

    this.ghostPinky_X = GHOST_PINKY_POSITION_X;
    this.ghostPinky_Y = GHOST_PINKY_POSITION_Y;
    this.ghostPinky_Dir = GHOST_PINKY_DIRECTION;
    this.ghostPinky_Moving = GHOST_PINKY_MOVING;
    this.ghostPinky_BodyState = GHOST_PINKY_BODY_STATE;
    this.ghostPinky_State = GHOST_PINKY_STATE;
    this.ghostPinky_EatTimer = GHOST_PINKY_EAT_TIMER;
    this.ghostPinky_AfraidTimer = GHOST_PINKY_AFFRAID_TIMER;
    this.ghostPinky_AfraidState = GHOST_PINKY_AFFRAID_STATE;
    this.ghostPinky_Tunnel = GHOST_PINKY_TUNNEL;

    this.ghostInky_X = GHOST_INKY_POSITION_X;
    this.ghostInky_Y = GHOST_INKY_POSITION_Y;
    this.ghostInky_Dir = GHOST_INKY_DIRECTION;
    this.ghostInky_Moving = GHOST_INKY_MOVING;
    this.ghostInky_BodyState = GHOST_INKY_BODY_STATE;
    this.ghostInky_State = GHOST_INKY_STATE;
    this.ghostInky_EatTimer = GHOST_INKY_EAT_TIMER;
    this.ghostInky_AfraidTimer = GHOST_INKY_AFFRAID_TIMER;
    this.ghostInky_AfraidState = GHOST_INKY_AFFRAID_STATE;
    this.ghostInky_Tunnel = GHOST_INKY_TUNNEL;

    this.ghostClyde_X = GHOST_CLYDE_POSITION_X;
    this.ghostClyde_Y = GHOST_CLYDE_POSITION_Y;
    this.ghostClyde_Dir = GHOST_CLYDE_DIRECTION;
    this.ghostClyde_Moving = GHOST_CLYDE_MOVING;
    this.ghostClyde_BodyState = GHOST_CLYDE_BODY_STATE;
    this.ghostClyde_State = GHOST_CLYDE_STATE;
    this.ghostClyde_EatTimer = GHOST_CLYDE_EAT_TIMER;
    this.ghostClyde_AfraidTimer = GHOST_CLYDE_AFFRAID_TIMER;
    this.ghostClyde_AfraidState = GHOST_CLYDE_AFFRAID_STATE;
    this.ghostClyde_Tunnel = GHOST_CLYDE_TUNNEL;
  },

  // resets a previously set model
  restorePacman: function() {
    PACMAN_DIRECTION = this.pacmanDirection;
    PACMAN_DIRECTION_TRY = this.pacmanDirTry;


    PACMAN_DIRECTION_TRY_TIMER = this.pacmanDirTryTimer;
    PACMAN_MOUNTH_STATE = this.pacmanMouthState;

    PACMAN_POSITION_X = this.pacmanX;
    PACMAN_POSITION_Y = this.pacmanY;
    PACMAN_MOVING = this.pacmanMoving;
    PACMAN_DEAD = this.pacmanDead;
  },

  restoreFood: function() {
    BUBBLES_ARRAY = this.bubbles;
    FRUITS_POSITION_X = this.fruitX;
    FRUITS_POSITION_Y = this.fruitY;
  },

  restoreGhosts: function() {
    GHOST_BLINKY_POSITION_X = this.ghostBlinky_X;
    GHOST_BLINKY_POSITION_Y = this.ghostBlinky_Y;
    GHOST_BLINKY_DIRECTION = this.ghostBlinky_Dir;
    GHOST_BLINKY_MOVING = this.ghostBlinky_Moving;
    GHOST_BLINKY_BODY_STATE = this.ghostBlinky_BodyState;
    GHOST_BLINKY_STATE = this.ghostBlinky_State;
    GHOST_BLINKY_EAT_TIMER = this.ghostBlinky_EatTimer;
    GHOST_BLINKY_AFFRAID_TIMER = this.ghostBlinky_AfraidTimer;
    GHOST_BLINKY_AFFRAID_STATE = this.ghostBlinky_AfraidState;
    GHOST_BLINKY_TUNNEL = this.ghostBlinky_Tunnel;

    GHOST_PINKY_POSITION_X = this.ghostPinky_X;
    GHOST_PINKY_POSITION_Y = this.ghostPinky_Y;
    GHOST_PINKY_DIRECTION = this.ghostPinky_Dir;
    GHOST_PINKY_MOVING = this.ghostPinky_Moving;
    GHOST_PINKY_BODY_STATE = this.ghostPinky_BodyState;
    GHOST_PINKY_STATE = this.ghostPinky_State;
    GHOST_PINKY_EAT_TIMER = this.ghostPinky_EatTimer;
    GHOST_PINKY_AFFRAID_TIMER = this.ghostPinky_AfraidTimer;
    GHOST_PINKY_AFFRAID_STATE = this.ghostPinky_AfraidState;
    GHOST_PINKY_TUNNEL = this.ghostPinky_Tunnel;

    GHOST_INKY_POSITION_X = this.ghostInky_X;
    GHOST_INKY_POSITION_Y = this.ghostInky_Y;
    GHOST_INKY_DIRECTION = this.ghostInky_Dir;
    GHOST_INKY_MOVING = this.ghostInky_Moving;
    GHOST_INKY_BODY_STATE = this.ghostInky_BodyState;
    GHOST_INKY_STATE = this.ghostInky_State;
    GHOST_INKY_EAT_TIMER = this.ghostInky_EatTimer;
    GHOST_INKY_AFFRAID_TIMER = this.ghostInky_AfraidTimer;
    GHOST_INKY_AFFRAID_STATE = this.ghostInky_AfraidState;
    GHOST_INKY_TUNNEL = this.ghostInky_Tunnel;

    GHOST_CLYDE_POSITION_X = this.ghostClyde_X;
    GHOST_CLYDE_POSITION_Y = this.ghostClyde_Y;
    GHOST_CLYDE_DIRECTION = this.ghostClyde_Dir;
    GHOST_CLYDE_MOVING = this.ghostClyde_Moving;
    GHOST_CLYDE_BODY_STATE = this.ghostClyde_BodyState;
    GHOST_CLYDE_STATE = this.ghostClyde_State;
    GHOST_CLYDE_EAT_TIMER = this.ghostClyde_EatTimer;
    GHOST_CLYDE_AFFRAID_TIMER = this.ghostClyde_AfraidTimer;
    GHOST_CLYDE_AFFRAID_STATE = this.ghostClyde_AfraidState;
    GHOST_CLYDE_TUNNEL = this.ghostClyde_Tunnel;
  },

  toString: function() {
    if(!this.stringRep) {
      this.stringRep = JSON.stringify(this);
    }
    return this.stringRep;
  }
};
