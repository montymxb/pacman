var KEYDOWN = false;
var PAUSE = false;
var LOCK = false;

var HIGHSCORE = 0;
var SCORE = 0;
var SCORE_BUBBLE = 10;
var SCORE_SUPER_BUBBLE = 50;
var SCORE_GHOST_COMBO = 200;

var LIFES = 2;
var GAMEOVER = false;

var LEVEL = 1;
var LEVEL_NEXT_TIMER = -1;
var LEVEL_NEXT_STATE = 0;

var TIME_GENERAL_TIMER = -1;
var TIME_GAME = 0;
var TIME_LEVEL = 0;
var TIME_LIFE = 0;
var TIME_FRUITS = 0;

var HELP_DELAY = 1500;
var HELP_TIMER = -1;

//
// Testing modifications
//


// Controls Speed of Ghosts in the game
// Increasing this decreases delay, increasing gameplay speed
var GameSpeedRatio = 5;
var agentPlaying = true;

//
// End Testing modifications
//


function blinkHelp() {
	if ( $('.help-button').attr("class").indexOf("yo") > -1 ) {
		$('.help-button').removeClass("yo");
	} else {
		$('.help-button').addClass("yo");
	}
}

function initGame(newgame) {

	if (newgame) {
		stopPresentation();
		stopTrailer();

		HOME = false;
		GAMEOVER = false;

		$('#help').fadeOut("slow");

		score(0);
		clearMessage();
		$("#home").hide();
		$("#panel").show();

		var ctx = null;
		var canvas = document.getElementById('canvas-panel-title-pacman');
		canvas.setAttribute('width', '38');
		canvas.setAttribute('height', '32');
		if (canvas.getContext) {
			ctx = canvas.getContext('2d');
		}

		var x = 15;
		var y = 16;

		ctx.fillStyle = "#fff200";
		ctx.beginPath();
		ctx.arc(x, y, 14, (0.35 - (3 * 0.05)) * Math.PI, (1.65 + (3 * 0.05)) * Math.PI, false);
		ctx.lineTo(x - 5, y);
		ctx.fill();
		ctx.closePath();

		x = 32;
		y = 16;

		ctx.fillStyle = "#dca5be";
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();

		if(LEVEL == 1) {
			// setup the scorer for the first time
			Scorer.setup();
		}

	}

	if(LEVEL == 1) {
		// start run for the scorer
		Scorer.startRun();
	}

	initBoard();
	drawBoard();
	drawBoardDoor();

	initPaths();
	drawPaths();

	initBubbles();
	drawBubbles();

	initFruits();

	initPacman();
	drawPacman();

	initGhosts();
	drawGhosts();

	lifes();

	ready();
}

function win() {
	stopAllSound();

	LOCK = true;
	stopPacman();
	stopGhosts();
	stopBlinkSuperBubbles();
	stopTimes();

	eraseGhosts();

	setTimeout("prepareNextLevel()", 1000);

}
function prepareNextLevel(i) {
	if ( LEVEL_NEXT_TIMER === -1 ) {
		eraseBoardDoor();
		LEVEL_NEXT_TIMER = setInterval("prepareNextLevel()", 250);
	} else {
		LEVEL_NEXT_STATE ++;
		drawBoard( ((LEVEL_NEXT_STATE % 2) === 0) );

		if ( LEVEL_NEXT_STATE > 6) {
			LEVEL_NEXT_STATE = 0;
			clearInterval(LEVEL_NEXT_TIMER);
			LEVEL_NEXT_TIMER = -1;
			nextLevel();
		}
	}
}
function nextLevel() {
	LOCK = false;

	LEVEL ++;

	erasePacman();
	eraseGhosts();

	resetPacman();
	resetGhosts();

	initGame();

	TIME_LEVEL = 0;
	TIME_LIFE = 0;
	TIME_FRUITS = 0;
}


function retry() {
	stopTimes();

	erasePacman();
	eraseGhosts();

	resetPacman();
	resetGhosts();

	drawPacman();
	drawGhosts();

	TIME_LIFE = 0;
	TIME_FRUITS = 0;

	ready();
}

function ready() {
	LOCK = true;
	message("ready!");

	// no ready sound either
	//playReadySound();
	setTimeout("go()", "200"); // 4100 old
}
function go() {
	// no siren sound for now
	//playSirenSound();

	LOCK = false;

	startTimes();

	clearMessage();
	blinkSuperBubbles();

	if(agentPlaying && !Agent.isActive()) {
		// get position from the agent instead

		// ALGOS //
		Agent.setAlgo(Algo.A_starM);
		//Agent.setAlgo(Algo.minimax);
		//Agent.setAlgo(Algo.dfs);
		//Agent.setAlgo(Algo.bfs);

		Agent.DEBUG = true;
		Algo.useAlphaBetaPruning = true;

		// killer move
		//Agent.useKillerFoodMove = true;

		// HEURISTICS //
		// bugged?
		// food count
		//Agent.setHeuristic(Heuristic.food_countM);

		// closest food distance
		//Agent.setHeuristic(Heuristic.food_distanceM);

		// closest ghost distance
		//Agent.setHeuristic(Heuristic.ghost_distanceM);

		// food or ghosts if too close
		// TODO RERUN looking for 1 LEVEL completion
		//Agent.setHeuristic(Heuristic.combo_ghost_foodM);

		// run, find food, and chase ghosts
		// observes!!
		//Agent.setHeuristic(Heuristic.combo_run_chase_find_foodM);

		// get food and keep distance (always gets stuck in tunnels)
		//Agent.setHeuristic(Heuristic.comboM);

		// get food & avoid ghosts, stay towards center of food positions
		// TODO best???
		//Agent.setHeuristic(Heuristic.combo_run_or_foodandghostsM);

		// combination of ghost distance & food count
		// TODO RERUN THIS ONE AS WELL (looking for 2 LEVEL completions)
		Agent.setHeuristic(Heuristic.combo_ghostDist_foodCount);

		Agent.activate();

	}

	movePacman();

	moveGhosts();
}


var AlgoIndex = 0;
function setCurrentAlgo(index) {
	AlgoIndex = index;
	updateAlgoAndHeuristic(AlgoIndex,HeuristicIndex);
}

var HeuristicIndex = 7;
function setCurrentHeuristic(index) {
	HeuristicIndex = index;
	updateAlgoAndHeuristic(AlgoIndex,HeuristicIndex);
}

function updateAlgoAndHeuristic(index,i2) {
	var e = "";
	if(index == 0) {
		Agent.setAlgo(Algo.A_starM);
		e = "A* w/ ";

	} else if(index == 1) {
		Agent.setAlgo(Algo.minimax);
		e = "Minimax w/ ";

	} else if(index == 2) {
		Agent.setAlgo(Algo.dfs);
		e = "DFS w/ no heuristic";

	} else {
		Agent.setAlgo(Algo.bfs);
		e = "BFS w/ no heuristic";

	}


	if(index < 2) {
		index = i2;
		if(index == 0) {
			Agent.setHeuristic(Heuristic.food_countM);
			e+= "Food Count";

		} else if(index == 1) {
			Agent.setHeuristic(Heuristic.food_distanceM);
			e+= "Closest Food Distance";

		} else if(index == 2) {
			Agent.setHeuristic(Heuristic.ghost_distanceM);
			e+= "Closest Ghost Distance";

		} else if(index == 3) {
			Agent.setHeuristic(Heuristic.combo_ghost_foodM);
			e+= "Food or Ghost Distance if too close";

		} else if(index == 4) {
			Agent.setHeuristic(Heuristic.combo_run_chase_find_foodM);
			e+= "Run, find food, chase ghosts";

		} else if(index == 5) {
			Agent.setHeuristic(Heuristic.comboM);
			e+= "Get food and keep distance";

		} else if(index == 6) {
			Agent.setHeuristic(Heuristic.combo_run_or_foodandghostsM);
			e+= "Get food and avoid ghosts, stay in center of map";

		} else {
			Agent.setHeuristic(Heuristic.combo_ghostDist_foodCount);
			e+= "Combination ghost distance and food count";

		}
	}

	document.getElementById("current-setup").innerHTML = e;
	retry();
}


function startTimes() {
	if (TIME_GENERAL_TIMER === -1) {
		TIME_GENERAL_TIMER = setInterval("times()", 1000);
	}
}
function times() {
	TIME_GAME ++;
	TIME_LEVEL ++;
	TIME_LIFE ++;
	TIME_FRUITS ++;

	fruit();
}
function pauseTimes() {
	if (TIME_GENERAL_TIMER != -1) {
		clearInterval(TIME_GENERAL_TIMER);
		TIME_GENERAL_TIMER = -1;
	}
	if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.pause();
}
function resumeTimes() {
	startTimes();
	if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.resume();
}
function stopTimes() {
	if (TIME_GENERAL_TIMER != -1) {
		clearInterval(TIME_GENERAL_TIMER);
		TIME_GENERAL_TIMER = -1;
	}
	if (FRUIT_CANCEL_TIMER != null) {
		FRUIT_CANCEL_TIMER.cancel();
		FRUIT_CANCEL_TIMER = null;
		eraseFruit();
	}
}

function pauseGame() {

	if (!PAUSE) {
		stopAllSound();
		PAUSE = true;

		message("pause");

		pauseTimes();
		pausePacman();
		pauseGhosts();
		stopBlinkSuperBubbles();

		Agent.deactivate();
	}
}
function resumeGame() {
	if (PAUSE) {
		testStateGhosts();

		PAUSE = false;

		clearMessage();

		resumeTimes();
		resumePacman();
		resumeGhosts();
		blinkSuperBubbles();

		Agent.activate();
	}
}

function lifes(l) {
	if (l) {
		if ( l > 0 ) {
			playExtraLifeSound();
		}
		LIFES += l;
	}

	var canvas = document.getElementById('canvas-lifes');
	canvas.setAttribute('width', '120');
	canvas.setAttribute('height', '30');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, 120, 30);
		ctx.fillStyle = "#fff200";
		for (var i = 0, imax = LIFES; (i < imax && i < 4); i ++) {
			ctx.beginPath();

			var lineToX = 13;
			var lineToY = 15;

			ctx.arc(lineToX + (i * 30), lineToY, 13, (1.35 - (3 * 0.05)) * Math.PI, (0.65 + (3 * 0.05)) * Math.PI, false);
			ctx.lineTo(lineToX + (i * 30) + 4, lineToY);
			ctx.fill();
			ctx.closePath();
		}
	}
}

function gameover() {
	GAMEOVER = true;
	message("game over");
	stopTimes();

	erasePacman();
	eraseGhosts();

	resetPacman();
	resetGhosts();

	TIME_GAME = 0;
	TIME_LEVEL = 0;
	TIME_LIFE = 0;
	TIME_FRUITS = 0;

	LIFES = 2;
	LEVEL = 1;
	SCORE = 0;
}

function message(m) {
	$("#message").html(m);
	if (m === "game over") $("#message").addClass("red");
}
function clearMessage() {
	$("#message").html("");
	$("#message").removeClass("red");
}

function score(s, type) {

	var scoreBefore = (SCORE / 10000) | 0;

	SCORE += s;
	if (SCORE === 0) {
		$('#score span').html("00");
	} else {
		$('#score span').html(SCORE);
	}

	var scoreAfter = (SCORE / 10000) | 0;
	if (scoreAfter > scoreBefore) {
		lifes( +1 );
	}


	if (SCORE > HIGHSCORE) {
		HIGHSCORE = SCORE;
		if (HIGHSCORE === 0) {
			$('#highscore span').html("00");
		} else {
			$('#highscore span').html(HIGHSCORE);
		}
	}

	if (type && (type === "clyde" || type === "pinky" || type === "inky" || type === "blinky") ) {
		erasePacman();
		eraseGhost(type);
		$("#board").append('<span class="combo">' + SCORE_GHOST_COMBO + '</span>');
		$("#board span.combo").css('top', eval('GHOST_' + type.toUpperCase() + '_POSITION_Y - 10') + 'px');
		$("#board span.combo").css('left', eval('GHOST_' + type.toUpperCase() + '_POSITION_X - 10') + 'px');
		SCORE_GHOST_COMBO = SCORE_GHOST_COMBO * 2;
	} else if (type && type === "fruit") {
		$("#board").append('<span class="fruits">' + s + '</span>');
		$("#board span.fruits").css('top', (FRUITS_POSITION_Y - 14) + 'px');
		$("#board span.fruits").css('left', (FRUITS_POSITION_X - 14) + 'px');
	}
}
