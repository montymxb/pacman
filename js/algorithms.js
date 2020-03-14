//
// algorithms.js
//
// Stores the algorithms to use for searching
//

var SucStep = (PACMAN_POSITION_STEP * 1.0);

function drawDebugPath() {
  if(Agent.DEBUG) {
    // debug mode
    var ctx = getDebugCanvasContext();
    for(var x = 0; x < Algo.exploredSet.length; x++) {
      var esi = Algo.exploredSet[x];
      //console.info("esiv:"+esi.val);
      var vv = Math.abs((esi.val - Algo.lastMinVal) / (Algo.lastMaxVal - Algo.lastMinVal));

      var hex = (Math.floor(vv * 255)).toString(16);
      var hex2 = (Math.floor((1.0 - vv) * 255)).toString(16);

      /*
      if(hex2 == "0") {
        console.info(">>"+vv);
        console.info(esi.val + ", "+Algo.lastMaxVal);
        console.info(1.0 - vv);
        console.info(Math.floor((1.0 - vv) * 255));
      }
      /**/

      ctx.fillStyle = "#"+ hex2 + hex + "00";
      ctx.beginPath();
      var pos = getContinuousPosition(esi.x,esi.y);
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();

    }
  }
}

function recordDebugNode(x,y,val) {
  var index = Algo.exploredSet.length;
  Algo.exploredSet[index] = {
    x: x,
    y: y,
    val: val
  };
  var sba = Math.abs(val);
  if(!Algo.lastMaxVal || sba > Algo.lastMaxVal) {
    Algo.lastMaxVal = sba;
  }
  if(!Algo.lastMinVal || sba < Algo.lastMinVal) {
    Algo.lastMinVal = sba;
  }
}

function getDebugCanvasContext() {
  var canvas = document.getElementById('canvas-debug');
	canvas.setAttribute('width', '550');
	canvas.setAttribute('height', '550');
  if(!this.canvasContext) {
    this.canvasContext = canvas.getContext('2d');
  }
  return this.canvasContext;
}

// rebuilds the best path we found while searching
// 2nd to last would be our destination then?
function rebuild_path(path, cur) {
  var tpath = [cur];
  for(var key in path) {
    if(key == cur.toString()) {
      cur = path[key];
      tpath.push(cur);
    }
  }
  return tpath;
}


function getLowestScorer(openset, hscores) {
  var leastScore = Number.MAX_SAFE_INTEGER;
  var leastNode = undefined;
  var leastIndex = 0;
  for(var x = 0; x < openset.length; x++) {
    if(hscores[openset[x].toString()] < leastScore) {
      leastScore = hscores[openset[x].toString()];
      leastNode = openset[x];
      leastIndex = x;
    }
  }
  return {
    cur: leastNode,
    index: leastIndex
  };
}


var Algo = {
  // A*
  /*
  A_star: function(heuristic) {
    if(!heuristic) {
      alert("Missing heuristic in A*!");
    }

    Algo.heuristic = heuristic;
    Algo.depthLimit = 3;
    Algo.nodesSearched = 1;
    var path = [];

    // start timing?

    // save world in model & push to path
    var m = new Model();
    m.direction = PACMAN_DIRECTION;
    m.storeWorld();
    path.push(m);

    //console.info("searching...");

    // set search limit of 1
    var result = Algo._algo_A_star(path, 0, 0);

    //console.info("result..."+result.dir);

    // restore world
    m.restoreWorld();

    // dump old path
    path = [];

    // return the best move (best direction found)
    return result.dir;

  },
  */


  // current A*
  A_starM: function(heuristic) {
    if(!heuristic) {
      alert("Missing heuristic in A*!");
    }

    Algo.heuristic = heuristic;
    Algo.depthLimit = 9;
    Algo.lastMaxVal = 0.0;

    // setup the explored set
    Algo.exploredSet = [];

    var path = [];
    var m = new Model();
    m.direction = PACMAN_DIRECTION;
    m.storeWorld2();
    path.push(m);

    //console.info(">>> search start d: "+m.direction+" ("+m.pacmanX+","+m.pacmanY+") "+Algo.heuristic(m));

    // set search limit of 1
    var result = Algo._algo_A_starM(path, 0, 0);

    // get cheapest cost path that works
    /*
    var resultPath = Algo._AstarM2();

    // pull 1st to last element, which has an associated direction
    var result = resultPath[resultPath.length - 2];
    if(!result) {
      // use only result then
      result = resultPath[resultPath.length - 1];

    }

    console.info("Result path length "+resultPath.length);

    // always invalid
    console.info("Result "+result.direction + "..."+resultPath.length);
    */

    //console.info(">>> Result "+result.dir + " $"+result.min);

    // draw the debug path
    drawDebugPath();

    // clear the explored set
    Algo.exploredSet = [];

    // return the best move (best direction found)
    return result.dir;

  },


  /*
  _AstarM2: function() {
    var searchLimit = 10;
    var nodesSearched = 0;
    var openset = [];

    // start timing?

    // save world in model & push to path
    var start = new Model();
    start.storeWorld2();
    start.direction = PACMAN_DIRECTION;
    openset.push(start);

    // path we construct
    var path = [];

    // store default score of 0
    var costs = [];
    costs[start.toString()] = Algo.heuristic(start);
    // store heuristic score

    while(openset.length > 0) {
      // get node in openset having lowest heuristic score
      var curRez = getLowestScorer(openset, costs);
      var cur = curRez.cur;
      var curIndex = curRez.index;

      if(nodesSearched > searchLimit) {
        // done searching, rebuild the best path we have
        return rebuild_path(path,cur);
      }

      // increment # nodes searched
      nodesSearched++;

      // remove this node from the openset
      openset.splice(curIndex, 1);

      // gen successors
      var successors = Algo.genSuccessorsM(cur);

      for(var x = 0; x < successors.length; x++) {

        // get successor
        var suc = successors[x];

        // get cost for this current node
        var tscore = costs[cur.toString()];

        // if this neighbor score is infinity || tentative score is lower than neighbor
        // todo flip tscore < hscores....always add if this node is cheaper than the last node
        if(!costs[suc.toString()] || costs[suc.toString()] < tscore) {
          // better scoring node than prior, use this one instead
          path[suc.toString()] = cur;
          // store heuristic score for successor as tscore & heuristic
          costs[suc.toString()] = Algo.heuristic(suc);

          ///
          //if(suc.didEatFood) {
            // best possible case
          //  return rebuild_path(path,suc);
        //  }
          //

          // add to openset if not already present
          if(!Algo.containedIn(openset, suc)) {
            openset.push(suc);
          }
        }
      }
    }
    // done
    return path;
  },
  */


  // gen successors off of the current model
  /*
  genSuccessors: function(m) {

    var successors = [];

    if(Agent.canMoveInDirection(1)) {
      // try right
      movePacman(1, true);
      // store and push this
      var mv = new Model();
      mv.direction = 1;

      PACMAN_POSITION_X += SucStep;

      mv.storeWorld();
      successors.push(mv);
      // restore old one
      m.restoreWorld();

    }

    if(Agent.canMoveInDirection(2)) {
      // try down
      movePacman(2, true);
      // store and push this
      var mv = new Model();
      mv.direction = 2;

      PACMAN_POSITION_Y += SucStep;

      mv.storeWorld();
      successors.push(mv);
      // restore old one
      m.restoreWorld();

    }

    if(Agent.canMoveInDirection(3)) {
      // try left
      movePacman(3, true);
      // store and push this
      var mv = new Model();
      mv.direction = 3;

      PACMAN_POSITION_X -= SucStep;

      mv.storeWorld();
      successors.push(mv);
      // restore old one
      m.restoreWorld();

    }

    if(Agent.canMoveInDirection(4)) {
      // try up
      movePacman(4, true);
      // store and push this
      var mv = new Model();
      mv.direction = 4;

      PACMAN_POSITION_Y -= SucStep;

      mv.storeWorld();
      successors.push(mv);
      // restore old one
      m.restoreWorld();

    }

    return successors;

  },
  */


  // gen successors off of the current model
  genSuccessorsM: function(m) {

    var successors = [];

    if(m.canMove(1) || (m.pacmanX == 25 && m.pacmanY == 13)) {
      // try right
      // store and push this
      var mv = new Model();
      mv.pacmanX    = m.pacmanX;
      mv.pacmanY    = m.pacmanY;
      mv.direction  = 1;
      mv.World      = m.World.slice();
      mv.ghostPos   = m.ghostPos.slice();
      mv.foodCount  = m.foodCount;
      if(m.pacmanX == 25 && m.pacmanY == 13) {
        // move through tunnel instead
        mv.pacmanX = 0;

      } else {
        // normal movement
        mv.movePacman(1);

      }

      successors.push(mv);

    }

    if(m.canMove(2)) {
      // try down
      // store and push this
      var mv = new Model();
      mv.pacmanX    = m.pacmanX;
      mv.pacmanY    = m.pacmanY;
      mv.direction  = 2;
      mv.World      = m.World.slice();
      mv.ghostPos   = m.ghostPos.slice();
      mv.foodCount  = m.foodCount;
      mv.movePacman(2);
      successors.push(mv);

    }

    if(m.canMove(3) || (m.pacmanX == 0 && m.pacmanY == 13)) {
      // try left
      // store and push this
      var mv = new Model();
      mv.pacmanX    = m.pacmanX;
      mv.pacmanY    = m.pacmanY;
      mv.direction  = 3;
      mv.World      = m.World.slice();
      mv.ghostPos   = m.ghostPos.slice();
      mv.foodCount  = m.foodCount;
      if(m.pacmanX == 0 && m.pacmanY == 13) {
        // move through tunnel
        mv.pacmanX = 25;

      } else {
        // normal move
        mv.movePacman(3);

      }

      successors.push(mv);

    }

    if(m.canMove(4)) {
      // try up
      // store and push this
      var mv = new Model();
      mv.pacmanX    = m.pacmanX;
      mv.pacmanY    = m.pacmanY;
      mv.direction  = 4;
      mv.World      = m.World.slice();
      mv.ghostPos   = m.ghostPos.slice();
      mv.foodCount  = m.foodCount;
      mv.movePacman(4);
      successors.push(mv);

    }

    return successors;

  },


  // gen successors for all the ghosts
  genGhostSuccessorsM: function(m) {
    var successors = [];
    for(var x = 0; x < 4; x++) {
      if(m.canGhostMove(x,1)) {
        // try right
        // store and push this
        var mv = new Model();
        mv.pacmanX    = m.pacmanX;
        mv.pacmanY    = m.pacmanY;
        mv.direction  = 1;
        mv.World      = m.World.slice();
        mv.ghostPos   = m.ghostPos.slice();
        mv.foodCount  = m.foodCount;
        mv.moveGhost(x,1);
        successors.push(mv);

      }

      if(m.canGhostMove(x,2)) {
        // try down
        // store and push this
        var mv = new Model();
        mv.pacmanX    = m.pacmanX;
        mv.pacmanY    = m.pacmanY;
        mv.direction  = 2;
        mv.World      = m.World.slice();
        mv.ghostPos   = m.ghostPos.slice();
        mv.foodCount  = m.foodCount;
        mv.moveGhost(x,2);
        successors.push(mv);

      }

      if(m.canGhostMove(x,3)) {
        // try left
        // store and push this
        var mv = new Model();
        mv.pacmanX    = m.pacmanX;
        mv.pacmanY    = m.pacmanY;
        mv.direction  = 3;
        mv.World      = m.World.slice();
        mv.ghostPos   = m.ghostPos.slice();
        mv.foodCount  = m.foodCount;
        mv.moveGhost(x,3);
        successors.push(mv);

      }

      if(m.canGhostMove(x,4)) {
        // try up
        // store and push this
        var mv = new Model();
        mv.pacmanX    = m.pacmanX;
        mv.pacmanY    = m.pacmanY;
        mv.direction  = 4;
        mv.World      = m.World.slice();
        mv.ghostPos   = m.ghostPos.slice();
        mv.foodCount  = m.foodCount;
        mv.moveGhost(x,4);
        successors.push(mv);

      }

    }
    return successors;
  },


  // returns whether a successor is contained in a given path
  containedIn: function(path, suc) {
    var s = suc.toString();
    for(var x = 0; x < path.length; x++) {
      if(path[x].toString() == suc) {
        return true;
      }
    }
    return false;
  },


  // internal algo solver
  /*
  _algo_A_star: function(path, cost, depth) {
    // get last elm we were checking
    var m = path[path.length-1];

    // calculate cost + this heuristic
    var h = Algo.heuristic();
    cost+=h;

    if(depth > Algo.depthLimit) {
      // too far, return this direction as is
      return {
        min: cost,
        dir: m.direction
      };

    }

    var min = Number.MAX_SAFE_INTEGER;
    var bestDir = -1;

    // get successors
    var successors = Algo.genSuccessors(m);

    //console.info("[] trying for "+successors.length + " successors");

    for(var q = 0; q < successors.length; q++) {
      //console.info("looping on "+q);
      // try successor if not already present in path
      var suc = successors[q];

      // only iterate over previously seen paths, or good for depth of 0
      if(!Algo.containedIn(path,suc) || depth == 0) {
        // add successor to path

        var pathClone = path.slice();

        pathClone.push(suc);

        // apply this model
        suc.restoreWorld();

        // search again
        var result = Algo._algo_A_star(pathClone, cost + 1.0, depth+1);

        //console.info(PACMAN_POSITION_X + ", " + PACMAN_POSITION_Y);
        //console.info(q+"~ dir "+suc.direction+" costs "+result.min);

        if(result.min < min) {
          // new min to beat
          min = result.min;
          // and apply as best direction of successor
          // not the result...
          bestDir = suc.direction;

          //console.info("> new min "+min);

        }
      }
    }

    // give back a combo of the min value and the best direction
    //console.info("Best dir "+bestDir);
    return {
      min: min,
      dir: bestDir
    };

  },
  */


  // internal algo solver
  _algo_A_starM: function(path, cost, depth) {
    // get last elm we were checking
    var m = path[path.length-1];

    // calculate cost + this heuristic
    var h = Algo.heuristic(m);
    cost+=h;

    if(depth >= Algo.depthLimit) {
      // too far, return this direction as is
      return {
        min: cost,
        dir: m.direction
      };

    }

    var min = Number.MAX_SAFE_INTEGER;
    var bestDir = -1;

    // get successors
    var successors = Algo.genSuccessorsM(m);

    //console.info("[] trying for "+successors.length + " successors");

    for(var q = 0; q < successors.length; q++) {
      //console.info("looping on "+q);
      // try successor if not already present in path
      var suc = successors[q];

      if(suc.didEatFood && Agent.useKillerFoodMove) {
        // best possible case, return immediately
        //console.info("Successor did eat food d: "+suc.direction + " ("+suc.pacmanX+","+suc.pacmanY+")");
        return {
          min: 0,
          dir: suc.direction
        }

      }

      // only iterate over previously seen paths, or good for depth of 0
      if(!Algo.containedIn(path,suc)) {
        // add successor to path

        var pathClone = path.slice();

        pathClone.push(suc);

        // search again
        var result = Algo._algo_A_starM(pathClone, cost + 1.0, depth+1);

        if(depth == 0) {
          //console.info("c: "+result.min + " d: "+suc.direction + " ("+suc.pacmanX+","+suc.pacmanY+")");
          //console.info("lmin: "+min);
        }

        // add to explored set for debugging
        if(Agent.DEBUG) {
          recordDebugNode(
            suc.pacmanX,
            suc.pacmanY,
            result.min
          );
        }

        if(result.min < min) {
          // new min to beat
          if(depth == 0) {
            //console.info("new min set to "+result.min);
          }

          min = result.min;
          // and apply as best direction of successor
          // not the result...
          bestDir = suc.direction;

          //console.info("> new min "+min);

        }
      }
    }

    // give back a combo of the min value and the best direction
    //console.info("Best dir "+bestDir);
    return {
      min: min,
      dir: bestDir
    };

  },


  // Iterative Minimax, for Adversarial search
  minimax: function(heuristic) {
    if(!heuristic) {
      alert("Missing heuristic in minimax!");
    }

    Algo.heuristic = heuristic;
    Algo.depthLimit = 5;
    Algo.lastMaxVal = 0.0;

    // setup the explored set
    Algo.exploredSet = [];

    var path = [];
    var m = new Model();
    m.direction = PACMAN_DIRECTION;
    m.storeWorld2();
    path.push(m);

    var result = Algo.minimax_min(m,0,-Number.MAX_SAFE_INTEGER);

    drawDebugPath();

    // clear the explored set
    Algo.exploredSet = [];

    return result.dir;
  },


  // minimizing player (pacman)
  minimax_min: function(m,limit,last) {
    if(limit >= Algo.depthLimit) {
      return {
        cost: Algo.heuristic(m),
        dir: m.direction
      };
    }

    var successors = Algo.genSuccessorsM(m);
    var l = successors.length;

    var v = Number.MAX_SAFE_INTEGER;
    var dir;

    for(var x = 0; x < l; x++) {
      var result = Algo.minimax_max(successors[x],limit+1,v);
      if(result.cost < v) {
        v = result.cost;
        dir = successors[x].direction;

        // add to explored set for debugging
        if(Agent.DEBUG) {
          recordDebugNode(
            successors[x].pacmanX,
            successors[x].pacmanY,
            v
          );
        }

        if(v < last && Algo.useAlphaBetaPruning) {
          // prune this branch, the max above already has a larger value
          return {
            cost: v,
            dir: dir
          };

        }
      }
    }

    return {
      cost: v,
      dir: dir
    };
  },


  // maximizing player (ghosts)
  // consider all ghosts on same team, so we'll
  // always take heuristic of the closest one
  minimax_max: function(m,limit,last) {
    if(limit >= Algo.depthLimit) {
      // ghosts always use basic distance heuristic to player
      return {
        cost: Algo.heuristic(m),
        dir: m.direction
      };
    }

    var successors = Algo.genGhostSuccessorsM(m);
    var l = successors.length;
    var v = -Number.MAX_SAFE_INTEGER;
    var dir;

    for(var x = 0; x < l; x++) {
      var result = Algo.minimax_min(successors[x],limit+1,v);
      if(result.cost > v) {
        v = result.cost;
        dir = successors[x].direction;

        // add to explored set for debugging
        if(Agent.DEBUG) {
          recordDebugNode(
            successors[x].pacmanX,
            successors[x].pacmanY,
            v
          );
        }

        if(v > last && Algo.useAlphaBetaPruning) {
          // prune this branch, the min above already has a lesser value
          return {
            cost: v,
            dir: dir
          };

        }
      }
    }

    return {
      cost: v,
      dir: dir
    };
  },


  // depth first search
  dfs: function() {
    // get current model
    Algo.depthLimit = 50;
    Algo.lastMaxVal = 0.0;

    var m = new Model();
    m.direction = PACMAN_DIRECTION;
    m.storeWorld2();

    //var fc = m.foodCount;

    // quantize world into model
    // setup a frontier array
    var frontier = [m];
    // setup a visited array (to avoid looping back)
    var visited = [];

    var goal = false;

    var depth = 0;

    while(frontier.length > 0) {
      // pull off and remove last item from frontier
      var cur = frontier[frontier.length-1];
      cur.nodes = [];
      frontier.splice(-1, 1);

      if(depth > Algo.depthLimit) {
        break;
      }

      depth++;

      // add to visited
      visited.push(cur);

      var successors = Algo.genSuccessorsM(cur);

      for(var x = 0; x < successors.length; x++) {
        var suc = successors[x];
        suc.parent = cur;
        if(!Algo.containedIn(visited,suc)) {
          // eval if food is present on this space
          if(suc.didEatFood) {
            // return this goal
            goal = suc;
            break;

          } else if(!suc.areGhostsOnPacman()) {
            // add to frontier
            frontier.push(suc);

          }
        }
      }

      if(goal) {
        break;
      }

    }

    if(goal) {
      // get the parent of the goal until it is m
      var step = goal;
      while(step.parent.toString() != m.toString()) {
        step = step.parent;
      }
      // take the direction of this node and apply it
      return step.direction;
    }

  },

  // breadth first search
  bfs: function() {
    // get current model
    //Algo.depthLimit = 50;
    Algo.lastMaxVal = 0.0;

    var m = new Model();
    m.direction = PACMAN_DIRECTION;
    m.storeWorld2();

    //var fc = m.foodCount;

    // quantize world into model
    // setup a frontier array
    var frontier = [m];
    // setup a visited array (to avoid looping back)
    var visited = [];

    var goal = false;

    var depth = 0;

    while(frontier.length > 0) {
      // pull off first most item on the list
      var cur = frontier[0];
      cur.nodes = [];
      // remove first item
      frontier.splice(0, 1);

      //if(depth > Algo.depthLimit) {
      //  break;
      //}

      depth++;

      // add to visited
      visited.push(cur);

      var successors = Algo.genSuccessorsM(cur);

      for(var x = 0; x < successors.length; x++) {
        var suc = successors[x];
        suc.parent = cur;
        if(!Algo.containedIn(visited,suc)) {
          // eval if food is present on this space
          if(suc.didEatFood) {
            // return this goal
            goal = suc;
            break;

          } else if(!suc.areGhostsOnPacman()) {
            // add to frontier
            frontier.push(suc);

          }
        }
      }

      if(goal) {
        break;
      }

    }

    if(goal) {
      // get the parent of the goal until it is m
      var step = goal;
      while(step.parent.toString() != m.toString()) {
        step = step.parent;
      }
      // take the direction of this node and apply it
      return step.direction;
    }
  }

};
