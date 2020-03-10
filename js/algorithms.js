//
// algorithms.js
//
// Stores the algorithms to use for searching
//

var SucStep = (PACMAN_POSITION_STEP * 1.0);

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
  var leastScore = 999999999;
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



  A_starM: function(heuristic) {
    if(!heuristic) {
      alert("Missing heuristic in A*!");
    }

    Algo.heuristic = heuristic;
    Algo.depthLimit = 5;

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

    // return the best move (best direction found)
    return result.dir;

  },


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

          /*
          if(suc.didEatFood) {
            // best possible case
            return rebuild_path(path,suc);
          }
          */

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


  // gen successors off of the current model
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


  // gen successors off of the current model
  genSuccessorsM: function(m) {

    var successors = [];

    if(m.canMove(1)) {
      // try right
      // store and push this
      var mv = new Model();
      mv.pacmanX    = m.pacmanX;
      mv.pacmanY    = m.pacmanY;
      mv.direction  = 1;
      mv.World      = m.World.slice();
      mv.ghostPos   = m.ghostPos.slice();
      mv.movePacman(1);
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
      mv.movePacman(2);
      successors.push(mv);

    }

    if(m.canMove(3)) {
      // try left
      // store and push this
      var mv = new Model();
      mv.pacmanX    = m.pacmanX;
      mv.pacmanY    = m.pacmanY;
      mv.direction  = 3;
      mv.World      = m.World.slice();
      mv.ghostPos   = m.ghostPos.slice();
      mv.movePacman(3);
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
      mv.movePacman(4);
      successors.push(mv);

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

    var min = 9999999999.9;
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

    var min = 9999999999.9;
    var bestDir = -1;

    // get successors
    var successors = Algo.genSuccessorsM(m);

    //console.info("[] trying for "+successors.length + " successors");

    for(var q = 0; q < successors.length; q++) {
      //console.info("looping on "+q);
      // try successor if not already present in path
      var suc = successors[q];

      /**/
      if(suc.didEatFood && Agent.useKillerFoodMove) {
        // best possible case, return immediately
        //console.info("Successor did eat food d: "+suc.direction + " ("+suc.pacmanX+","+suc.pacmanY+")");
        return {
          min: 0,
          dir: suc.direction
        }

      }
      /**/

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


  // Minimax, for Adversarial search
  minimax: function(heuristic) {
    if(!heuristic) {
      alert("Missing heuristic in minimax!");
    }
  }

};
