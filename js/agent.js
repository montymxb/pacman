//
// agent.js
//
// Adds an agent program to play PacMan
//

function getRandDir() {
  return Math.floor((Math.random() * 4) + 1);
}

var Agent = {

  // sets the algo to use
  setAlgo: function(algo) {
    Agent.algo = algo;
  },

  // sets the heuristic to use
  setHeuristic: function(heuristic) {
    Agent.heuristic = heuristic;
  },

  isActive: function() {
    return Agent.active;
  },

  // turns this thing on
  activate: function() {
    Agent.active = true;
    var randDelay = Math.floor((Math.random() * 10) + 1);
    Agent.movingInterval = setInterval(Agent.makeMove, PACMAN_MOVING_SPEED * 5.29 + randDelay);
    Agent.lastDirection = -1;
    Agent.lastPosition = 0;
  },

  deactivate: function() {
    Agent.active = false;
    clearInterval(Agent.movingInterval);
  },

  // returns a move
  // 1 = +X (RIGHT)
  // 2 = +Y (DOWN)
  // 3 = -X (LEFT)
  // 4 = -Y (UP)
  makeMove: function() {

    if(LOCK) {
      // do nothing while locked
      return;
    }

    // Math.floor((Math.random() * 4) + 1)
    var dir = Agent.algo(Agent.heuristic);
    //var dir = getRandDir();

    if(dir > -1) {
      // valid move, apply
      //console.info("Move apply: " + dir);
      movePacman(dir);
      Agent.lastDirection = dir;

    }

    //Agent.lastPosition = {x: PACMAN_POSITION_X, y: PACMAN_POSITION_Y};
  },


  isStuckInDir: function(dir) {
    if(Agent.lastDirection == dir && !PACMAN_MOVING) {
      return true;
    }
    return false;
  },


  // TODO Option to wrap is Stuck functionality inside the agent itself
  // Calls this in gen-successors, to avoid generating shitty successors
  // then, we can maintain that we are actively avoiding being trapped, right?
  // print out the current X and Y pos, and see if it updates when stuck
  // if not, we can use that (and the lastDirection) to determine when we are stuck (and can no longer move forward)
  canMoveInDirection: function(dir) {
    return canMovePacman(dir); // !Agent.isStuckInDir(dir)
  }

};

Agent.active = false;
